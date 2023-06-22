import { Request, Response } from "express";
import { UserModel, IUser } from "../model/user-model";
import { UserPayload } from "../interfaces/UserPayload";
import { setTokenCookie } from "../middleware/authentication";

// Accepts user payload. Deletes the user with the given email, and returns a status of 200 with a message indicating that the user was deleted.
export const deleteUser = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = req.user as UserPayload;
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

// Accepts newUsername from the request body and user payload. Updates the user's username, sets a token cookie, and returns a status of 200 with a message indicating that the username was updated.
export const updateUsername = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = req.user as UserPayload;
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
  res: Response
  ) => {
  try {
    const user = req.user as UserPayload;
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



export default {
  deleteUser,
  updateUsername,
  updateEmail
};
