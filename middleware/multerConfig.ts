import multer from 'multer';
import path from 'path';
import fs from 'fs';

export const storage = multer.diskStorage({
  destination: function(req: any, file, cb) {
    // Prüfen Sie, ob req.user verfügbar ist
    if (!req.user) {
      return cb(new Error('No user present in request'), './uploads');
    }

    // Erstellen Sie einen Pfad für den Benutzer
    const userFolderPath = path.join('./uploads', `${req.user.username}-${req.user.userId}`);

    // Überprüfen Sie, ob der Ordner existiert, und erstellen Sie ihn gegebenenfalls
    if (!fs.existsSync(userFolderPath)) {
      fs.mkdirSync(userFolderPath, { recursive: true });
    }

    // Verwenden Sie den neuen Pfad als Ziel
    cb(null, userFolderPath);
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

export const upload = multer({ storage: storage });
