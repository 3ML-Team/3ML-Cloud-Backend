import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { UserModel, IUser } from "../model/user-model";
import bcrypt from "bcrypt";

export const postLogin = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    "email-password-strategy",
    (err: Error, user: IUser, info: any) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!user) {
        // Benutzer nicht gefunden oder ungültiges Passwort
        return res.status(401).json({ error: info.message });
      }
      return res.status(200).json(user);
    }
  )(req, res, next);
};

export const postRegister = async (req: Request, res: Response) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    const user = await UserModel.findOne({ email: email });

    if (user) {
      console.log("User already exists");
      return res.status(409).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new UserModel({
      userName: name,
      email: email,
      password: hashedPassword,
    });

    await newUser.save(); // Use .save() to save the new user to the database

    console.log(newUser);

    return res.status(201).json(newUser);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Error creating user" });
  }
};

export const googleAuthentication = passport.authenticate("google", {
  scope: ["profile", "email"],
});

export const handleGoogleAuthRedirect = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("google", (err: Error, user: IUser) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(200).json(user || req.user); // Return either the user object or req.user if user is undefined
  })(req, res, next);
};


export const handleLogout = (req: Request, res: Response, next: NextFunction) => {
  req.logout(function (err) {
    if (err) {
      console.error(err);
      return next(err);
    }
    return res.status(200).json({ message: "User successfully logged out." });
  });
}

export default {
  postLogin,
  postRegister,
  googleAuthentication,
  handleGoogleAuthRedirect,
  handleLogout
};

