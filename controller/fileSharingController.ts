import { Request, Response } from "express";
import * as fs from "fs";
import archiver from "archiver";
import FileModel from "../model/file-model";
import {IFile} from "../model/file-model";
import { UserPayload } from "../interfaces/UserPayload";
import {getUserFolderPath} from "../middleware/multerConfig"
import path from "path";

export const test = (req: Request, res: Response): void => {
  console.log(req.user);
  res.sendStatus(200);
};

//Kann man effizenter machen. Wird dann aber nch komplizierter.
const addFileToArchive = async (file: any, parentPath: string, archive: archiver.Archiver) => {
  const filePath = path.join(parentPath, file.originalName).split(path.sep).join('/');
  if (file.type === 'folder') {
    const children = await FileModel.find({ parent: file._id });
    for (const child of children) {
      await addFileToArchive(child, filePath, archive);
    }
  } else {
    archive.file(filePath, { name: file.path.split(path.sep).join('/') });
  }
};


export const uploadFiles = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user as UserPayload;
    const files = req.files as Express.Multer.File[];
    const relativePaths = JSON.parse(req.body.relativePath);
    const userFolderPath = getUserFolderPath(req).replace("\\", "/");
    let uploadedFiles: IFile[] = [];

    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      const fullPath = `${userFolderPath}/${file.filename}`; 

      const newFile = new FileModel({
        originalName: file.originalname,
        size: file.size,
        type: file.mimetype,
        path: fullPath,
        lastModified: new Date(),
        owner: user.userId,
      });

      await newFile.save();

      let currentParentPath = userFolderPath;
      let parentId = null;

      const pathParts = relativePaths[index].split('/');
      for (let i = 0; i < pathParts.length - 1; i++) { // Exclude the file itself
        const part = pathParts[i];

        if (!part) continue;

        currentParentPath += '/' + part;

        let parentFile = await FileModel.findOne({ path: currentParentPath, originalName: part });
        if (!parentFile) {
          parentFile = new FileModel({
            originalName: part,
            size: 0,
            type: 'folder',
            path: currentParentPath,
            lastModified: new Date(),
            owner: user.userId,
            children: [],
          });
          await parentFile.save();
        }

        if (!parentFile.children.includes(newFile._id)) {
          parentFile.children.push(newFile._id);
          parentFile.size += newFile.size;
          parentFile.lastModified = new Date();
          await parentFile.save();
        }

        parentId = parentFile._id;
      }

      newFile.parent = parentId;
      await newFile.save();

      uploadedFiles.push(newFile);
    }

    let responseFile: IFile | null = null;

    const parentFolderName = getCommonPrefix(relativePaths);

    if (parentFolderName) { // This means all files/folders share a common parent
      responseFile = await FileModel.findOne({ originalName: parentFolderName, owner: user.userId, type: 'folder' });
    } else if (uploadedFiles.length === 1) { // If only one file/folder is uploaded
      responseFile = uploadedFiles[0];
    } else { // Multiple files/folders are uploaded at the root level, create a "download" folder
      const parentPath = userFolderPath + "/" + "download";

      const parentFile = new FileModel({
        originalName: "download",
        size: uploadedFiles.reduce((total, file) => total + file.size, 0),
        type: "folder",
        path: parentPath,
        lastModified: new Date(),
        owner: user.userId,
        children: uploadedFiles.map((file) => file._id),
      });

      await parentFile.save();
      responseFile = parentFile;
    }

    if (!responseFile) {
      res.status(400).json({ message: 'No files processed.' });
      return;
    }

    const currentHost = req.headers.host;
    const fileLink = `http://${currentHost}/file/data/${responseFile._id}`;

    res.status(200).json(fileLink);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

function getCommonPrefix(paths: string[]): string | null {
  if (paths.length === 0) {
    return null;
  }
  
  let prefix = paths[0];
  for (let i = 1; i < paths.length; i++) {
    while (paths[i].indexOf(prefix) !== 0) {
      prefix = prefix.substring(0, prefix.length - 1);
    }
  }
  
  const lastSlashIndex = prefix.lastIndexOf('/');
  if (lastSlashIndex !== -1) {
    prefix = prefix.substring(0, lastSlashIndex);
  }
  
  return prefix || null;
}









export const downloadAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const fileId = req.params.fileId;
    const file = await FileModel.findById(fileId);

    if (!file) {
      res.sendStatus(404);
      return;
    }

    if (file.type !== 'folder') {
      const filePath = file.path.split(path.sep).join('/');
      res.download(filePath);
      return;
    }

    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    archive.on('error', function(err) {
      throw err;
    });

    res.attachment('download.zip');
    archive.pipe(res);

    const children = await FileModel.find({ parent: file._id });
    for (const child of children) {
      await addFileToArchive(child, '', archive);
    }

    archive.finalize();
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};



export default {
  test,
  uploadFiles,
  downloadAll,
};
