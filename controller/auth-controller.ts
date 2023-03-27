import { Request, Response, NextFunction } from "express";
import passport, { use } from "passport";
import { UserModel, IUser } from "../model/user-model";
import bcrypt from "bcrypt";
import "dotenv/config";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { getEmailTemplate, transporter } from "../asset/email-template";
import { UserPayload } from "../interfaces/UserPayload";
import { userInfo } from "os";


export const postLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email: email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }
    setTokenCookie(res, user);

    const requestObject = {
      email: user.email,
      username: user.username,
    }
    return res.status(200).json(requestObject);
  } catch (error: any) {
    console.error(error.message);
    return res.status(500).json({ error: "Server error" });
  }
};

export const postRegister = async (req: Request, res: Response) => {
  try {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    const user = await UserModel.findOne({ email: email });

    if (user) {
      console.log("User already exists");
      return res.status(409).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new UserModel({
      username: username,
      email: email,
      password: hashedPassword,
    });
    await newUser.save();
    setTokenCookie(res, newUser);
    
    const requestObject = {
      username: username,
      email: email
    }
    return res.status(201).json(requestObject);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Error creating user" });
  }
};

export const googleAuthentication = passport.authenticate("google");

export const handleGoogleAuthRedirect = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate("google", async (err: Error, profile: any) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    try {
      const email = profile.emails![0].value;
      const username = profile.displayName;
      const googleId = profile.id;
      const thumbnail = profile.photos?.[0].value;

      let currentUser = await UserModel.findOne({ email: email });
      if (currentUser != null) {
        // Update Information
        currentUser.username = username;
        currentUser.email = email!;
        currentUser.thumbnail = thumbnail!;

        await currentUser.save();
        console.log("Current user is: ", currentUser);
        res.status(200).json(currentUser);
      } else {
        // Create New User
        currentUser = await UserModel.create({
          email: email,
          username: username,
          googleId: googleId,
          thumbnail: thumbnail,
        });
        const requestObject = {
          username: username,
          email: email
        }
        setTokenCookie(res, currentUser);
        res.status(200).json(requestObject);
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  })(req, res, next);
};

export const handleLogout = (req: Request, res: Response) => {
  res.clearCookie("jwt");

  // Optional: Lösche das Refresh-Token-Cookie, falls verwendet
  // res.clearCookie("refreshToken");
  res.status(200).json({ message: "User successfully logged out." });
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const email = req.body.email;
    const buffer = crypto.randomBytes(32);
    const resetToken = buffer.toString("hex");
    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return res
        .status(400)
        .json({ error: "No account with that email found." });
    }

    user.resetToken = resetToken;
    user.resetTokenExpiration = new Date(Date.now() + 3600000);
    await user.save();
    const emailTemplate: string = getEmailTemplate(resetToken); 
    //Redirect to the reset password page where users can enter their new password.
    transporter.sendMail({
      to: email,
      from: process.env.OUTLOOK_EMAIL,
      subject: "Password reset",
      html: emailTemplate
    });

    res.status(200).json({ message: "Password reset email sent." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const validateResetToken = async (req: Request, res: Response) => {
  try {
    const resetToken = req.query.resetToken;
    const user = await UserModel.findOne({
      resetToken: resetToken,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(404)
        .json({ error: "No user found or token has expired" });
    }

    res.status(200).json({ message: "Token is valid, you can reset the password.", token: resetToken });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
};
export const submitNewPassword = async (req: Request, res: Response) => {
  const newPassword = req.body.password;
  const resetToken = req.body.resetToken;

  try {
    const user = await UserModel.findOne({
      resetToken: resetToken,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error updating password" });
  }
};

export const deleteUser = async (req: Request, res: Response, user: UserPayload) => {
  try {
    if (user.email) {
      await UserModel.deleteOne({ email: user.email });
      return res.status(200).json({ message: 'User deleted' });
    } else {
      return res.status(400).json({ error: 'User email not found' });
    }
  } catch (error: any) {
    return res.status(500).json({ error: 'Error deleting user', message: error.message });
  }
};



const setTokenCookie = (res: Response, user: IUser) => {
  const secret = process.env.JWT_SECRET as string;
  const userObject = user.toObject(); // Konvertiere das Mongoose-Dokument in ein JavaScript-Objekt
  const payload = {
    userId: userObject._id,
    email: userObject.email,
    username: userObject.username,
  };
  const token = jwt.sign(payload, secret, { expiresIn: "1h" });
  res.cookie("jwt", token, {
    httpOnly: true,
    maxAge: 3600000, // 1 hour
  });
  return token;
};



export default {
  postLogin,
  postRegister,
  googleAuthentication,
  handleGoogleAuthRedirect,
  handleLogout,
  requestPasswordReset,
  validateResetToken,
  submitNewPassword,
  deleteUser
};
