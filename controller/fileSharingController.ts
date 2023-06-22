import { Request, Response } from "express";
import * as fs from "fs";
import path from "path";
import archiver from "archiver";
import FileModel from "../model/file-model";
import { UserPayload } from "../interfaces/UserPayload";
import { v4 as uuidv4 } from "uuid";

export const test = (req: Request, res: Response): void => {
  console.log(req.user);
  res.sendStatus(200);
};

const extractTopTwoFolderPath = (filePath: string) => {
  const parts = filePath.split(path.sep);

  // Extrahieren Sie nur die ersten beiden Ordner des Pfads
  const topTwoFoldersPath = parts.slice(0, 2).join(path.sep);
  console.log(topTwoFoldersPath);
  return topTwoFoldersPath;
};


export const uploadFiles = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user as UserPayload;
    const files = req.files as Express.Multer.File[];

    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const newFile = new FileModel({
          originalName: file.originalname,
          size: file.size,
          type: file.mimetype,
          path: file.path,
          lastModified: new Date(),
          owner: user.userId,
        });

        await newFile.save();
        return newFile;
      })
    );

    let responseFile;

    if (uploadedFiles.length === 1) {
      responseFile = uploadedFiles[0];
    } else {
      const parentPath = extractTopTwoFolderPath(
        uploadedFiles[0].path
      );
      const parentFile = new FileModel({
        originalName: "download",
        size: uploadedFiles.reduce((total, file) => total + file.size, 0),
        type: "folder",
        path: parentPath,
        lastModified: new Date(),
        owner: user.userId,
        children: uploadedFiles.map((file) => file.id),
      });

      await parentFile.save();
      responseFile = parentFile;
    }

    const currentHost = req.headers.host;
    const fileLink = `http://${currentHost}/file/data/${responseFile.id}`;

    res.status(200).json(fileLink);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

export const downloadAll = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const fileId = req.params.fileId;
    const file = await FileModel.findById(fileId);

    if (!file) {
      res.status(404).json({ error: "File not found" });
      return;
    }

    // If it's a regular file, download it
    if (file.type !== "folder") {
      return res.download(file.path, file.originalName);
    }

    // If it's a folder, zip all its children
    const files = await FileModel.find({ _id: { $in: file.children } });

    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    archive.on("error", function (err: Error) {
      res.status(500).send({ error: err.message });
    });

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.originalName}.zip"`
    );

    archive.pipe(res);

    for (const childFile of files) {
      const fileStream = fs.createReadStream(childFile.path);
      fileStream.on("error", (err: Error) => {
        console.error(`Error in reading file: ${err}`);
        return res.status(500).send({ error: "Error in reading file" });
      });
      archive.append(fileStream, { name: childFile.originalName });
    }

    archive.finalize();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};


export default {
  test,
  uploadFiles,
  downloadAll,
};
