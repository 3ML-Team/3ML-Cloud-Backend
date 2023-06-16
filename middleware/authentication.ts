// middleware/authentication.ts
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { UserPayload } from "../interfaces/UserPayload";
import { IUser } from "../model/user-model";

export const authenticateUser = (
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

// Accepts a response object and a user object. Creates a JWT with the user's ID, email, and username, sets a cookie with the token, and returns the token. The cookie expires in 1 hour.
export const setTokenCookie = (res: Response, user: IUser) => {
  const secret = process.env.JWT_SECRET as string;
  const userObject = user.toObject(); // Konvertiere das Mongoose-Dokument in ein JavaScript-Objekt
  const payload = {
    userId: userObject._id,
    email: userObject.email,
    username: userObject.username,
  };
  const token = jwt.sign(payload, secret, { expiresIn: "1h" });
  res.cookie("jwt", token, {
    httpOnly: true,
    maxAge: 3600000, // 1 hour
  });
  return token;
};

