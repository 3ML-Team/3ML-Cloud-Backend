import { Schema, model, Document } from 'mongoose';
import { IUser } from './user-model';

interface IFile extends Document {
  originalName: string;
  size: number;
  type: string;
  path: string;
  lastModified: Date;
  owner: IUser;
}

const fileSchema = new Schema({
  originalName: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  lastModified: {
    type: Date,
    required: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const File = model<IFile>('File', fileSchema);

export default File;
