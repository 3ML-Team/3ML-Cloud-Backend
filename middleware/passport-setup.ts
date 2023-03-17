import { Strategy as LocalStrategy } from "passport-local";
import { UserModel, IUser } from "../model/user-model";
import bcrypt from "bcrypt";
import "dotenv/config";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";

const authenticateUserWithEmail = async (
  email: string,
  password: string,
  done: done
) => {
  const user: IUser | null = await UserModel.findOne({ email: email });
  console.log(user);
  if (user == null) {
    return done(null, false, { message: "No user with that email" });
  }

  try {
    if (await bcrypt.compare(password, user.password)) {
      return done(null, user);
    } else {
      return done(null, false, { message: "Password incorrect" });
    }
  } catch (e) {
    return done(e);
  }
};

const authenticateUserWithGoogle = async (
  accessToken: string,
  refreshToken: string,
  profile: any,
  done: done
) => {
  try {
    const email = profile.emails![0].value;
    const username = profile.displayName;
    const googleId = profile.id;
    const thumbnail = profile.photos?.[0].value;

    let currentUser = await UserModel.findOne({ email: email });
    if (currentUser != null) {
      // Update Information
      currentUser.userName = username;
      currentUser.email = email!;
      currentUser.thumbnail = thumbnail!;

      await currentUser.save();
      console.log("Current user is: ", currentUser);
      done(null, currentUser);
    } else {
      //Create New User
      currentUser = await UserModel.create({
        email: email,
        username: username,
        googleId: googleId,
        thumbnail: thumbnail,
      });
      console.log("New user created: ", currentUser);
      done(null, currentUser);
    }
  } catch (err) {
    done(err);
  }
};

// Define the types for the function arguments
type done = (
  error: any,
  user?: any | null,
  options?: { message: string }
) => void;

function setupPassport(passport: any) {
  passport.serializeUser((user: IUser, done: done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done: done) => {
    try {
      const user = await UserModel.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });


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
