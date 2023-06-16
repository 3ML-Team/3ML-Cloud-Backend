import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { UserModel, IUser } from "../model/user-model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { setTokenCookie } from "../middleware/authentication";

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

// Handles the OAuth authentication process.
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
        const username = profile.displayName ?? `${profile.username}`;
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



// Clears the JWT cookie (and optionally the refreshToken cookie) and returns a status of 200 with a message indicating that the user was logged out successfully.
export const handleLogout = (req: Request, res: Response) => {
  res.clearCookie("jwt");

  // Optional: Lösche das Refresh-Token-Cookie, falls verwendet
  // res.clearCookie("refreshToken");
  res.status(200).json({ message: "User successfully logged out." });
};


export default {
  postRegister,
  postLogin,
  oauthAuthentication,
  handleOAuthRedirect,
  handleLogout
};
