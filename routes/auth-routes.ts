import express, { Router, Request, Response, NextFunction } from "express";

import dotenv from "dotenv";
dotenv.config();
import authController, { handleLogout } from "../controller/auth-controller";
import authentication from "../middleware/authentication";

const authRouter: Router = express.Router();

//Normal login/registration
authRouter.post("/login", authController.postLogin);

authRouter.post("/register", authController.postRegister);

//Google authentication
authRouter.get("/google", authController.googleAuthentication);

authRouter.get("/google/redirect", authController.handleGoogleAuthRedirect);

// Handles logout
authRouter.get("/logout", handleLogout);

authRouter.get("/home", authentication.isLoggedIn, (req: Request, res: Response) => {
    console.log("home");
    res.send("home");
});


export default authRouter;
