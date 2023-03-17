import express, { Router, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config();
import authController from "../controller/auth-controller";

const authRouter: Router = express.Router();

//Normal login/registration
authRouter.post("/login", authController.postLogin);

authRouter.post("/register", authController.postRegister);

//Google authentication
authRouter.get("/google", authController.googleAuth);

authRouter.get("/google/redirect", authController.handleGoogleAuthRedirect);

// Handles logout
authRouter.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      console.error(err);
      return next(err);
    }
    return res.status(200).json({ message: "User successfully logged out." });
  });
});

export default authRouter;
