import { Request, Response } from "express";
import { UserModel } from "../model/user-model";
import crypto from "crypto";
import bcrypt from 'bcrypt'
import { sendResetPasswordEmail } from "../email/email-service";

//Reset Password
// Accepts email from the request body. Generates a password reset token, updates the user with the token and expiration,
// sends an email with the reset link, and returns a status of 200 with a message indicating that the email was sent.
export const requestPasswordReset = async (req: Request, res: Response) => {
  console.log(req.cookies);
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


export default {
  requestPasswordReset,
  validateResetToken,
  submitNewPassword,
};
