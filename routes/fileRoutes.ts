import express, { Router, Request, Response } from "express";
import fileSharingController from "../controller/fileSharingController";
import { authenticateUser } from "../middleware/authentication";
import { upload } from "../middleware/multerConfig";

const fileSharingRouter: Router = express.Router();

fileSharingRouter.get(
    "/test",
    authenticateUser(),
    fileSharingController.test
);

fileSharingRouter.post(
    "/upload",
    authenticateUser(),
    upload.array('files'),
    fileSharingController.uploadFiles
);

export default fileSharingRouter;
