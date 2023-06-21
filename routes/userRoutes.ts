import express, { Router, Request, Response } from "express";
import { authenticateUser } from "../middleware/authentication";
import userController from "../controller/userOperations";

const userOperationsRouter: Router = express.Router();

userOperationsRouter.patch(
  "/request-email-reset",
  authenticateUser((req: Request, res: Response) => {
    userController.updateEmail(req, res);
  })
);

userOperationsRouter.patch(
  "/request-username-reset",
  authenticateUser((req: Request, res: Response) => {
    userController.updateUsername(req, res);
  })
);

userOperationsRouter.delete(
  "/delete",
  authenticateUser((req: Request, res: Response) => {
    userController.deleteUser(req, res);
  })
);

export default userOperationsRouter;
