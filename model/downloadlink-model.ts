import { Schema, model, Document } from 'mongoose';

interface IDownloadLink extends Document {
  linkId: string;
  files: string[]; // Array of file IDs
  createdDate: Date;
}

const downloadLinkSchema = new Schema({
  linkId: {
    type: String,
    required: true,
    unique: true,
  },
  files: [String],
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

const DownloadLink = model<IDownloadLink>('DownloadLink', downloadLinkSchema);

export default DownloadLink;
