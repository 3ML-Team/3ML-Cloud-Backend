import express, { Router, Request, Response, NextFunction } from "express";

import dotenv from "dotenv";
dotenv.config();
import authController from "../controller/auth-controller";
import * as authentication from "../middleware/authentication";
import { UserPayload } from "../interfaces/UserPayload";

const authRouter: Router = express.Router();


//Normal login/registration
authRouter.post("/login", authController.postLogin);

authRouter.post("/register", authController.postRegister);

//Oauth authentication
authRouter.get("/google", authController.oauthAuthentication("google"));
authRouter.get("/discord", authController.oauthAuthentication("discord"));
authRouter.get("/github", authController.oauthAuthentication("github"));



authRouter.get("/google/redirect", authController.handleOAuthRedirect("google"));
authRouter.get("/discord/redirect", authController.handleOAuthRedirect("discord"));
authRouter.get("/github/redirect", authController.handleOAuthRedirect("github"));



// Handles logout
authRouter.get("/logout", authController.handleLogout);

authRouter.post("/request-password-reset", authController.requestPasswordReset);
authRouter.get("/validate-reset-token", authController.validateResetToken);
//Should be a patch request.
authRouter.post("/submit-new-password", authController.submitNewPassword);

authRouter.patch("/request-email-reset", authentication.authenticateUser((req: Request, res: Response, user: UserPayload) => {
    authController.updateEmail(req, res, user);
  }),);

authRouter.patch("/request-username-reset", authentication.authenticateUser((req: Request, res: Response, user: UserPayload) => {
    authController.updateUsername(req, res, user);
  }));

authRouter.delete("/delete", authentication.authenticateUser((req: Request, res: Response, user: UserPayload) => {
    authController.deleteUser(req, res, user);
  }),);


authRouter.get("/home", authentication.authenticateUser((req: Request, res: Response, user: UserPayload) => {
    res.send("home, User email: " + user.email);
  }));


export default authRouter;
