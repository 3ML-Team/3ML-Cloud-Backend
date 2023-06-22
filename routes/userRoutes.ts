import express, { Router } from "express";
import { authenticateUser } from "../middleware/authentication";
import userController from "../controller/userOperationsController";

const userOperationsRouter: Router = express.Router();

userOperationsRouter.patch(
  "/request-email-reset",
  authenticateUser(),
  userController.updateEmail
);

userOperationsRouter.patch(
  "/request-username-reset",
  authenticateUser(),
  userController.updateUsername
);

userOperationsRouter.delete(
  "/delete",
  authenticateUser(),
  userController.deleteUser
);

export default userOperationsRouter;
