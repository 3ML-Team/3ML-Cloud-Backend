import { Schema, model, Document, Types } from 'mongoose';

interface IDownloadLink extends Document {
  linkId: string;
  files: Types.ObjectId[]; // Array of file IDs
  createdDate: Date;
}

const downloadLinkSchema = new Schema({
  linkId: {
    type: String,
    required: true,
    unique: true,
  },
  files: [{
    type: Schema.Types.ObjectId,
    ref: 'File'
  }],
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

const DownloadLink = model<IDownloadLink>('DownloadLink', downloadLinkSchema);

export default DownloadLink;
