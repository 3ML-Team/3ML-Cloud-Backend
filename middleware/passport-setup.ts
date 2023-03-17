import { Strategy as LocalStrategy } from "passport-local";
import { UserModel, IUser } from "../model/user-model";
import "dotenv/config";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import {
  authenticateUserWithEmail,
  authenticateUserWithGoogle,
  handleDeserializeUser,
  handleSerializeUser,
} from "./passport-authentication";

// Define the types for the function arguments
type done = (
  error: any,
  user?: any | null,
  options?: { message: string }
) => void;

function setupPassport(passport: any) {
  passport.serializeUser(handleSerializeUser);
  passport.deserializeUser(handleDeserializeUser);

  if (!process.env.GOOGLE_CLIENT_ID! || !process.env.GOOGLE_CLIENT_SECRET!) {
    console.error(
      "GOOGLE_CLIENT_ID oder GOOGLE_CLIENT_SECRET  not found in environment variables"
    );
    process.exit(1);
  }

  passport.use(
    "email-password-strategy",
    new LocalStrategy({ usernameField: "email" }, authenticateUserWithEmail)
  );

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/redirect",
        scope: ["profile", "email"],
      },
      authenticateUserWithGoogle
    )
  );
}

export default setupPassport;
