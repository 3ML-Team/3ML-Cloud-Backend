import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const isLoggedIn = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: Missing token" });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET as string) ;
    req.user = user;

    return next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

export default {
    isLoggedIn
  };
