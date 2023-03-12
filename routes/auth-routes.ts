import express, { Router, Request, Response } from "express";
import { UserModel, IUser } from "../model/user-model";
import bcrypt from "bcrypt";
import passport from "passport";

const authRouter: Router = express.Router();

authRouter.post("/login", passport.authenticate('email-password-strategy', {
    successRedirect: '/',
    failureRedirect: '/login'
}));


authRouter.post("/register", (req: Request, res: Response) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  UserModel.findOne({ email: email })
    .then((user: IUser | null) => {
      if (user != null) {
        console.log("User already exists");
        res.redirect("/login");
      } else {
        return bcrypt.hash(password, 12).then((hashPassword) => {
          const user = new UserModel({
            name: name,
            email: email,
            password: hashPassword,
          });
          console.log(user);
          return UserModel.create(user).then(() => {
            res.send("register");
          });
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Error creating user");
    });
});

authRouter.post("/google", (req: Request, res: Response) => {
  res.send("login");
});

export default authRouter;
