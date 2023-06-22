import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from "uuid";

export const getUserFolderPath = (req: any): string => {
  if (!req.user) {
    throw new Error('No user present in request');
  }

  return path.join('./uploads', `${(req.user.username as string).replace(/\s/g, '_')}-${req.user.userId}`);
}

export const storage = multer.diskStorage({
  destination: function(req: any, file, cb) {
    try {
      const userFolderPath = getUserFolderPath(req);

      if (!fs.existsSync(userFolderPath)) {
        fs.mkdirSync(userFolderPath, { recursive: true });
      }

      cb(null, userFolderPath);
    } catch (error) {
      cb(error instanceof Error ? error : null, './uploads');
    }
  },
  filename: function(req, file, cb) {
    cb(null, uuidv4() + '-' + file.originalname);
  }
});

export const upload = multer({ storage: storage });
