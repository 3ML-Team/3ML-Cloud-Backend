import { Schema, model, Document, Types } from 'mongoose';
import { IUser } from './user-model';

export interface IFile extends Document {
  originalName: string;
  size: number;
  type: string;
  path: string;
  lastModified: Date;
  owner: IUser;
  children: IFile[];
  parent: IFile | null;
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
  },
  children: [{
    type: Schema.Types.ObjectId,
    ref: 'File'
  }],
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'File',
    default: null,
  },
});

const File = model<IFile>('File', fileSchema);

export default File;
