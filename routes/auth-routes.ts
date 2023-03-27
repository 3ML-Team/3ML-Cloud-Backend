import express, { Router, Request, Response, NextFunction } from "express";

import dotenv from "dotenv";
dotenv.config();
import authController from "../controller/auth-controller";
import authentication from "../middleware/authentication";

const authRouter: Router = express.Router();

//Normal login/registration
authRouter.post("/login", authController.postLogin);

authRouter.post("/register", authController.postRegister);

//Google authentication
authRouter.get("/google", authController.googleAuthentication);

authRouter.get("/google/redirect", authController.handleGoogleAuthRedirect);

// Handles logout
authRouter.get("/logout", authController.handleLogout);

authRouter.post("/request-password-reset", authController.requestPasswordReset)
authRouter.get("/validate-reset-token/:token", authController.validateResetToken)
authRouter.post("/submit-new-password", authController.submitNewPassword)



authRouter.get("/home", authentication.isLoggedIn, (req: Request, res: Response) => {
    console.log("home");
    res.send("home");
});


export default authRouter;
