import multer from 'multer';
import path from 'path';
import fs from 'fs';

export const storage = multer.diskStorage({
  destination: function(req: any, file, cb) {
    if (!req.user) {
      return cb(new Error('No user present in request'), './uploads');
    }

    const userFolderPath = path.join('./uploads', `${req.user.username}-${req.user.userId}`);

    if (!fs.existsSync(userFolderPath)) {
      fs.mkdirSync(userFolderPath, { recursive: true });
    }

    cb(null, userFolderPath);
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

export const upload = multer({ storage: storage });
