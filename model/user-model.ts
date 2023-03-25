import mongoose from "mongoose";

interface IUser extends mongoose.Document {
  id: string;
  username: string;
  email: string;
  password: string;
  googleId: String;
  thumbnail: String;
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
  googleId: {
    type: String,
  },
  thumbnail: {
    type: String,
  },
});

const UserModel = mongoose.model<IUser>("User", userSchema);

export { UserModel, IUser };
