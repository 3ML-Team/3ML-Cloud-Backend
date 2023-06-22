import express, { Router, Request, Response } from "express";
import fileSharingController from "../controller/fileSharingController";
import multer from 'multer';
import { authenticateUser } from "../middleware/authentication";

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

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
