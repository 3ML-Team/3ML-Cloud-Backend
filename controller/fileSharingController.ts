import { Request, Response } from "express";
import FileModel from "../model/file-model";
import { UserPayload } from "../interfaces/UserPayload";

export const test = (req: Request, res: Response) => {
  console.log(req.user);
  res.send(200);
};

export const uploadFiles = async (req: Request, res: Response) => {
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
          owner: user.userId
        });

        await newFile.save();
        return newFile;
      })
    );

    //Todo: Sus. Data via file.id accessable. Security risk! Also if there is more than one file!!!
    // const fileLinks = uploadedFiles.map((file) => {
    //     const fileName = path.basename(file.path);
    //     return `${req.headers.origin}/file/${fileName}`;
    //   });

    const file = uploadedFiles[0];
    const fileLink = `${req.headers.origin}/data/${file.id}`;
  
      console.log(fileLink);
      res.status(200).json(fileLink);
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  };

export default {
  test,
  uploadFiles,
};
