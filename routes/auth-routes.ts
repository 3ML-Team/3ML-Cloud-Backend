import express, { Router, Request, Response, NextFunction } from "express";

import dotenv from "dotenv";
dotenv.config();
import authController, { handleLogout } from "../controller/auth-controller";

const authRouter: Router = express.Router();

//Normal login/registration
authRouter.post("/login", authController.postLogin);

authRouter.post("/register", authController.postRegister);

//Google authentication
authRouter.get("/google", authController.googleAuthentication);

authRouter.get("/google/redirect", authController.handleGoogleAuthRedirect);

// Handles logout
authRouter.get("/logout", handleLogout);

authRouter.get("/home", authController.authMiddleware, (req: Request, res: Response) => {
    console.log("home");
    res.send("home");
});


export default authRouter;
