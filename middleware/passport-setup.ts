import "dotenv/config";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as DiscordStrategy } from 'passport-discord';

type done = (
  error: any,
  user?: any | null,
  options?: { message: string }
) => void;

function setupPassport(passport: any) {
  // Check the environment variables before initializing the strategies
  checkEnvVariables();

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: "/auth/google/redirect",
        scope: ["profile", "email"],
      },
      (accessToken, refreshToken, profile, done) => {
        done(null, profile);
      }
    )
  );

  passport.use(
    new DiscordStrategy({
      clientID: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      callbackURL: "/auth/discord/redirect",
      scope: ["identify", "email"]
    },
    (accessToken, refreshToken, profile, done) => {
      // save user profile to database
      return done(null, profile);
    })
  );
}

function checkEnvVariables() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error(
      "GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not found in environment variables"
    );
    process.exit(1);
  }

  if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET) {
    console.error(
      "DISCORD_CLIENT_ID or DISCORD_CLIENT_SECRET not found in environment variables"
    );
    process.exit(1);
  }
}

export default setupPassport;
