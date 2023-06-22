import { Request, Response } from "express";
import * as fs from "fs";
import archiver from "archiver";
import FileModel from "../model/file-model";
import { UserPayload } from "../interfaces/UserPayload";
import DownloadLinkModel from "../model/downloadlink-model";
import { v4 as uuidv4 } from "uuid";

export const test = (req: Request, res: Response): void => {
  console.log(req.user);
  res.sendStatus(200);
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

    const fileIds = uploadedFiles.map((file) => file.id);
    const downloadLink = new DownloadLinkModel({
      linkId: uuidv4(),
      files: fileIds,
    });
    await downloadLink.save();

    const currentHost = req.headers.host;
    const fileLink = `http://${currentHost}/file/data/${downloadLink.linkId}`;

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
    const linkId = req.params.linkId;
    console.log("linkId in downloadAll ist: " + linkId);
    const downloadLink = await DownloadLinkModel.findOne({ linkId: linkId });

    if (!downloadLink) {
      res.status(404).json({ error: "Download link not found" });
      return;
    }

    const files = await FileModel.find({ _id: { $in: downloadLink.files } });
    // if there's only one file, download it directly
    if (files.length === 1) {
      const file = files[0];
      return res.download(file.path, file.originalName);
    }

    
    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    archive.on("error", function (err: Error) {
      res.status(500).send({ error: err.message });
    });

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="download.zip"`);

    archive.pipe(res);

    for (const file of files) {
      const fileStream = fs.createReadStream(file.path);
      fileStream.on("error", (err: Error) => {
        console.error(`Error in reading file: ${err}`);
        return res.status(500).send({ error: "Error in reading file" });
      });
      archive.append(fileStream, { name: file.originalName });
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
