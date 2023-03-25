import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { UserModel, IUser } from "../model/user-model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const postLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email: email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    setTokenCookie (res, user);

    return res.status(200).json({ user });
  } catch (error: any) {
    console.error(error.message);
    return res.status(500).json({ error: "Server error" });
  }
};

export const postRegister = async (req: Request, res: Response) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    const user = await UserModel.findOne({ email: email });

    if (user) {
      console.log("User already exists");
      return res.status(409).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new UserModel({
      username: name,
      email: email,
      password: hashedPassword,
    });

    await newUser.save();
    setTokenCookie (res, newUser);

    return res.status(201).json(newUser);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Error creating user" });
  }
};

export const googleAuthentication = passport.authenticate("google", {
  scope: ["profile", "email"],
});

export const handleGoogleAuthRedirect = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("google", (err: Error, user: IUser) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(200).json(user || req.user);
  })(req, res, next);
};


export const handleLogout = (req: Request, res: Response, next: NextFunction) => {
  req.logout(function (err) {
    if (err) {
      console.error(err);
      return next(err);
    }
    return res.status(200).json({ message: "User successfully logged out." });
  });
};

const setTokenCookie  = (res: Response, user: IUser) => {
  const secret = process.env.JWT_SECRET as string;
  const userObject =     {
    userId: user._id,
    email: user.email,
    username: user.username,
  };
  const token = jwt.sign( userObject , secret, { expiresIn: "1h" });
  res.cookie("jwt", token, {
    httpOnly: true,
    maxAge: 3600000, // 1 hour
  });
  return token;
};

export const authMiddleware = (
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
  postLogin,
  postRegister,
  googleAuthentication,
  handleGoogleAuthRedirect,
  handleLogout,
  authMiddleware
};

