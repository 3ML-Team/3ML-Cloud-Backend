import { Strategy as LocalStrategy } from "passport-local";
import { UserModel, IUser } from "../model/user-model";
import bcrypt from "bcrypt";

// Define the types for the function arguments
type done = (error: any, user?: any, options?: { message: string }) => void;

function setupPassport(passport: any) {
  const authenticateUser = async (email: string, password: string, done: done) => {
    const user: IUser | null = await UserModel.findOne({email: email});

    if (!user) {
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

  passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));
  passport.serializeUser((user: any, done: done) => done(null, user.id));
  passport.deserializeUser((id: string, done: done) => {
    return done(null, UserModel.findById(id));
  });
}

export default setupPassport;
