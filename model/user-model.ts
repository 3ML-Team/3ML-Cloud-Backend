import mongoose from "mongoose";

interface IUser extends mongoose.Document {
  id: string;
  username: string;
  email: string;
  password: string;
  googleId: String;
  thumbnail: String;
  resetToken: String | undefined;
  resetTokenExpiration: Date | undefined;
}

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    // required: true,
  },
  email: {
    type: String,
    // required: true,
  },
  password: {
    type: String,
  },
  oauthID: {
    type: String,
  },
  thumbnail: {
    type: String,
  },
  resetToken: String,
  resetTokenExpiration: Date
});

const UserModel = mongoose.model<IUser>("User", userSchema);

export { UserModel, IUser };
