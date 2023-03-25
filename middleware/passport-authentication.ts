import { UserModel, IUser } from "../model/user-model";
import bcrypt from "bcrypt";
import "dotenv/config";

// Define the types for the function arguments
type done = (
  error: any,
  user?: any | null,
  options?: { message: string }
) => void;

export const authenticateUserWithEmail = async (
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

export const authenticateUserWithGoogle = async (
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
      currentUser.username = username;
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

export const handleSerializeUser = (user: IUser, done: done) => done(null, user.id)

export const handleDeserializeUser = async (id: string, done: done) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
};

export default {
  authenticateUserWithEmail,
  authenticateUserWithGoogle,
  serializeUser: handleSerializeUser,
  deserializeUser: handleDeserializeUser
}