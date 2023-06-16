import express, { Router, Request, Response } from "express";
import authController from "../controller/auth-controller";
import {authenticateUser} from "../middleware/authentication";
import { UserPayload } from "../interfaces/UserPayload";

const userOperationsRouter: Router = express.Router();

userOperationsRouter.patch(
  "/request-email-reset",
  authenticateUser((req: Request, res: Response, user: UserPayload) => {
    authController.updateEmail(req, res, user);
  })
);

userOperationsRouter.patch(
  "/request-username-reset",
  authenticateUser((req: Request, res: Response, user: UserPayload) => {
    authController.updateUsername(req, res, user);
  })
);

userOperationsRouter.delete(
  "/delete",
  authenticateUser((req: Request, res: Response, user: UserPayload) => {
    authController.deleteUser(req, res, user);
  })
);

export default userOperationsRouter;
