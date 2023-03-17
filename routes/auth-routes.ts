import express, { Router, Request, Response, NextFunction } from "express";
import { UserModel, IUser } from "../model/user-model";
import bcrypt from "bcrypt";
import passport from "passport";
import dotenv from "dotenv";
dotenv.config();

const authRouter: Router = express.Router();

authRouter.post(
  "/login",
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("email-password-strategy", (err: Error, user: IUser, info: any) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!user) {
        // Benutzer nicht gefunden oder ungültiges Passwort
        return res.status(401).json({ error: info.message });
      }
      return res.status(200).json(user);
    })(req, res, next);
  }
);



authRouter.post("/login", (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("email-password-strategy", (err: Error, user: IUser, info: any) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      // Benutzer nicht gefunden oder ungültiges Passwort
      return res.status(401).json({ error: info.message });
    }
    return res.status(200).json(user);
  })(req, res, next);
});

authRouter.post("/register", async (req: Request, res: Response) => {
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

    UserModel.create(newUser);
    console.log(newUser);

    return res.status(201).json(newUser);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Error creating user" });
  }
});


authRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

authRouter.get(
  "/google/redirect",
  passport.authenticate("google"),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/`);
  }
);

authRouter.get("/logout", (req, res, next) => {
  // handle logut with passport
  req.logout(function (err) {
    if (err) {
      console.error(err);
      return next(err);
    }
    res.redirect(`${process.env.FRONTEND_URL}/login`);
  });
});

authRouter.get("/userData", (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.status(200).json(req.user);
  } else {
    return res.status(401).send("User is not logged in");
  }
});

export default authRouter;
