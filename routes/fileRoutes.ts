import express, { Router, Request, Response } from "express";
import fileSharingControler from "../controller/fileSharingControler";
import { authenticateUser } from "../middleware/authentication";
import { UserPayload } from "../interfaces/UserPayload";

const fileSharingRouter: Router = express.Router();

fileSharingRouter.get(
    "/test",
    authenticateUser((req: Request, res: Response) => {
        fileSharingControler.test(req, res);
    })
  );


export default fileSharingRouter;
