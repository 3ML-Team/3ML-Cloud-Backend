import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { UserModel, IUser } from "../model/user-model";
import bcrypt from "bcrypt";
import "dotenv/config";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";

const transporter = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: process.env.OUTLOOK_EMAIL,
    pass: process.env.OUTLOOK_PASSWORD,
  },
});

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

    return res.status(200).json({ user });
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

    return res.status(201).json(newUser);
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
        setTokenCookie(res, currentUser);
        res.status(200).json(currentUser);
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

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const email = req.body.email;
    const buffer = crypto.randomBytes(32);
    const token = buffer.toString("hex");
    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return res
        .status(400)
        .json({ error: "No account with that email found." });
    }

    user.resetToken = token;
    user.resetTokenExpiration = new Date(Date.now() + 3600000);
    await user.save();
    
    transporter.sendMail({
      to: email,
      from: process.env.OUTLOOK_EMAIL,
      subject: "Password reset",
      html: `
        <p>You requested a password reset</p>
        <p>Click this <a href="http://localhost:8080/auth/resetpassword/${token}">link</a> to set a new password.</p>
      `,
    });

    res.status(200).json({ message: "Password reset email sent." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
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
  resetPassword
};
