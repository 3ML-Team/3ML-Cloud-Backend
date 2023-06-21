import { Request, Response, NextFunction } from "express";


export const test = (req: Request, res: Response) => {
    console.log(req.user);
    res.send(200);
}

export default {
    test
  };