// middleware/authentication.ts
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { UserPayload } from "../interfaces/UserPayload";

export const isLoggedIn = (
  handler: (req: Request, res: Response, user: UserPayload) => void
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log("Im isLoggedIn");
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: Missing token" });
    }

    try {
      const user: UserPayload = jwt.verify(token, process.env.JWT_SECRET as string) as UserPayload;
      req.user = user;
      handler(req, res, user);
    } catch (error) {
      console.error(error);
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
  };
};
