import express, { Router, Request, Response } from "express";
import { UserModel, IUser } from "../model/user-model";
import bcrypt from "bcrypt";
import passport from "passport";
import dotenv from "dotenv";
dotenv.config();

const authRouter: Router = express.Router();

authRouter.post(
  "/login",
  passport.authenticate("email-password-strategy", {
    successRedirect: `${process.env.FRONTEND_URL}/`,
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
  })
);

authRouter.post("/register", (req: Request, res: Response) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  UserModel.findOne({ email: email })
    .then((user: IUser | null) => {
      if (user != null) {
        console.log("User already exists");
        res.redirect(`${process.env.FRONTEND_URL}/login`);
      } else {
        return bcrypt.hash(password, 12).then((hashPassword) => {
          const user = new UserModel({
            name: name,
            email: email,
            password: hashPassword,
          });
          console.log(user);
          return UserModel.create(user).then(() => {
            res.redirect(`${process.env.FRONTEND_URL}/`);
          });
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Error creating user");
    });
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
