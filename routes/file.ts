import express, { Request, Response, NextFunction, Router } from 'express';

const fileRouter: Router = express.Router();


fileRouter.get('/:fileID', (req: Request, res: Response, next: NextFunction) => {
  // TODO: Get file
  console.log('Getting file');
  res.send('File retrieved successfully');
});
fileRouter.get('/details/:fileID', (req: Request, res: Response, next: NextFunction) => {
  // TODO: Get file details
  console.log('Getting file details');
  res.send('File details retrieved successfully');
});


fileRouter.post('/:fileID', (req: Request, res: Response, next: NextFunction) => {
  // TODO: Upload file
  console.log('Uploading file details');
  res.send('File details uploaded successfully');
});


fileRouter.put('/:fileID', (req: Request, res: Response, next: NextFunction) => {
  // TODO: Update file
  console.log('Updating file');
  res.send('File updated successfully');
});
fileRouter.put('/details/:fileID', (req: Request, res: Response, next: NextFunction) => {
  // TODO: Update file details
  console.log('Updating file details');
  res.send('File details updated successfully');
});


fileRouter.patch('/details/:fileID', (req: Request, res: Response, next: NextFunction) => {
  // TODO: Update parts of the file's details
  console.log('Updating parts of file details');
  res.send('File details updated successfully');
});


fileRouter.delete('/:fileID', (req: Request, res: Response, next: NextFunction) => {
  // TODO: Delete file
  console.log('Deleting file');
  res.send('File deleted successfully');
});


export default fileRouter;
