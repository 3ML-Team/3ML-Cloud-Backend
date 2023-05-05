import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { UserModel, IUser } from "../model/user-model";
import bcrypt from "bcrypt";
import "dotenv/config";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { UserPayload } from "../interfaces/UserPayload";
import { sendResetPasswordEmail } from "../email/email-service";
// Accepts username, email, and password from the request body.
// Creates a new user in the database, hashes the password, sets a token cookie, and returns a status of 201 with the new user's username and email.
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
      email: email,
    };
    return res.status(201).json(requestObject);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Error creating user" });
  }
};

// Accepts email and password from the request body.
// Authenticates the user, sets a token cookie, and returns a status of 200 with the user's email and username.
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
    };
    return res.status(200).json(requestObject);
  } catch (error: any) {
    console.error(error.message);
    return res.status(500).json({ error: "Server error" });
  }
};

//Reset Password
// Accepts email from the request body. Generates a password reset token, updates the user with the token and expiration,
// sends an email with the reset link, and returns a status of 200 with a message indicating that the email was sent.
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

    sendResetPasswordEmail(email, resetToken);
    res.status(200).json({ message: "Password reset email sent." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Validates the password reset token from the request query. If valid, returns a status of 200 with a message indicating that the token is valid.
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

    res
      .status(200)
      .json({ message: "Token is valid, you can reset the password." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Accepts new password and reset token from the request body. Updates the user's password, clears the reset token and expiration, and returns a status of 200 with a message indicating that the password was updated successfully.
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

export const oauthAuthentication = (provider: string) =>
  passport.authenticate(provider);

export const handleOAuthRedirect =
  (provider: string) => (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(provider, async (err: Error, profile: any) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      try {
        const email = profile.emails?.[0].value ?? profile.email;
        const username =
          profile.displayName ?? `${profile.username}`;
        const oauthID = profile.id;
        const thumbnail =
          profile.photos?.[0].value ??
          (profile.avatar
            ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
            : `https://cdn.discordapp.com/embed/avatars/${
                Number(profile.discriminator) % 5
              }.png`);
    
        let currentUser = await UserModel.findOne({ email: email });
        if (currentUser && oauthID == currentUser.oauthID) {
          // Update Information
          currentUser.username = username;
          currentUser.email = email;
          currentUser.thumbnail = thumbnail;
          await currentUser.save();
        } else if (currentUser == null) {
          // Create New User
          currentUser = await UserModel.create({
            username,
            email,
            thumbnail,
            oauthID,
          });
          setTokenCookie(res, currentUser);
        }
        res
        .status(200)
        .redirect(
          `http://localhost:3000/login?username=${username}&email=${email}&thumbnail=${thumbnail}`
        );
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    })(req, res, next);
    
  };

// Accepts newUsername from the request body and user payload. Updates the user's username, sets a token cookie, and returns a status of 200 with a message indicating that the username was updated.
export const updateUsername = async (
  req: Request,
  res: Response,
  user: UserPayload
) => {
  try {
    const { newUsername } = req.body;
    if (!newUsername) {
      return res.status(400).json({ error: "Username is required" });
    }
    if (user.email) {
      const updatedUser = await UserModel.findOneAndUpdate(
        { email: user.email },
        { username: newUsername },
        { new: true }
      );
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      setTokenCookie(res, updatedUser);
      return res.status(200).json({ message: "Username updated" });
    } else {
      return res.status(400).json({ error: "User email not found" });
    }
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: "Error updating username", message: error.message });
  }
};

// Accepts email from the request body and user payload. Updates the user's email, sets a token cookie, and returns a status of 200 with a message indicating that the email was updated.
export const updateEmail = async (
  req: Request,
  res: Response,
  user: UserPayload
) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    if (user.email) {
      // Überprüfen, ob die neue E-Mail bereits vorhanden ist
      const emailExists = await UserModel.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ error: "Email already exists" });
      }
      const updatedUser = await UserModel.findOneAndUpdate(
        { email: user.email },
        { email },
        { new: true }
      );
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      setTokenCookie(res, updatedUser);
      return res.status(200).json({ message: "Email updated" });
    } else {
      return res.status(400).json({ error: "User email not found" });
    }
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: "Error updating email", message: error.message });
  }
};

// Clears the JWT cookie (and optionally the refreshToken cookie) and returns a status of 200 with a message indicating that the user was logged out successfully.
export const handleLogout = (req: Request, res: Response) => {
  res.clearCookie("jwt");

  // Optional: Lösche das Refresh-Token-Cookie, falls verwendet
  // res.clearCookie("refreshToken");
  res.status(200).json({ message: "User successfully logged out." });
};

// Accepts user payload. Deletes the user with the given email, and returns a status of 200 with a message indicating that the user was deleted.
export const deleteUser = async (
  req: Request,
  res: Response,
  user: UserPayload
) => {
  try {
    if (user.email) {
      await UserModel.deleteOne({ email: user.email });
      return res.status(200).json({ message: "User deleted" });
    } else {
      return res.status(400).json({ error: "User email not found" });
    }
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: "Error deleting user", message: error.message });
  }
};

// Accepts a response object and a user object. Creates a JWT with the user's ID, email, and username, sets a cookie with the token, and returns the token. The cookie expires in 1 hour.
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
  oauthAuthentication,
  handleOAuthRedirect,
  handleLogout,
  requestPasswordReset,
  validateResetToken,
  submitNewPassword,
  deleteUser,
  updateEmail,
  updateUsername,
};
