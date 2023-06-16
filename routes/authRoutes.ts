import express, { Router } from "express";
import authController from "../controller/authController";

const authenticationRouter: Router = express.Router();

//Normal login/registration
authenticationRouter.post("/login", authController.postLogin);
authenticationRouter.post("/register", authController.postRegister);

//Oauth authentication
authenticationRouter.get("/google", authController.oauthAuthentication("google"));
authenticationRouter.get("/discord", authController.oauthAuthentication("discord"));
authenticationRouter.get("/github", authController.oauthAuthentication("github"));

authenticationRouter.get("/google/redirect", authController.handleOAuthRedirect("google"));
authenticationRouter.get("/discord/redirect", authController.handleOAuthRedirect("discord"));
authenticationRouter.get("/github/redirect", authController.handleOAuthRedirect("github"));

// Handles logout
authenticationRouter.get("/logout", authController.handleLogout);

export default authenticationRouter;
