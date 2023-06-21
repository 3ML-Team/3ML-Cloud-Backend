import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

export const test = (req: Request, res: Response) => {
    console.log(req.user);
    res.send(200);
}

export const uploadFiles = (req: Request, res: Response) => {
    console.log(req.user);
    console.log(req.files);
    res.send(200);
}

export default {
    test,
    uploadFiles
  };