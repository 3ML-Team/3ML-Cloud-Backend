import express, { Router, Request, Response } from "express";
const authRouter: Router = express.Router();

authRouter.post('/login', (req: Request, res:Response) => {
    console.log(req.body);
    res.send('login');
});


authRouter.post('/register', (req: Request, res:Response) => {

    console.log(req.body);
    res.send('register');
});


authRouter.post('/google', (req: Request, res:Response) => {
    res.send('login');
});



export default authRouter;