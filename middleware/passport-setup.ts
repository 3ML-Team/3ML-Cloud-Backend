import "dotenv/config";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// Define the types for the function arguments
type done = (
  error: any,
  user?: any | null,
  options?: { message: string }
) => void;

function setupPassport(passport: any) {
  if (!process.env.GOOGLE_CLIENT_ID! || !process.env.GOOGLE_CLIENT_SECRET!) {
    console.error(
      "GOOGLE_CLIENT_ID oder GOOGLE_CLIENT_SECRET  not found in environment variables"
    );
    process.exit(1);
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/redirect",
        scope: ["profile", "email"],
      },
      (accessToken, refreshToken, profile, done) => {
        done(null, profile); // Gib einfach das Profil-Objekt an den Callback weiter
      }
    )
  );
}

export default setupPassport;
