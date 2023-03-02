import express, { Router, Request, Response } from 'express';

const indexRouter: Router = express.Router();

/* GET home page. */
indexRouter.get('/', (req: Request, res: Response) => {
    res.send("3ML-Backend: Index page");
});

export default indexRouter;