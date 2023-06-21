import express, { Router, Request, Response } from 'express'
import mongoose from 'mongoose';
import "dotenv/config";
import setupPassport from './middleware/passport-setup';
import passport, { Passport } from 'passport';
setupPassport(passport);
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
const app = express();

import authRouter from './routes/authRoutes'
import userRouter from './routes/userRoutes'
import fileSharingRouter from './routes/fileRoutes'


// Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger('dev'));
app.use(cookieParser());

const corsOptions = {
  origin: 'http://localhost:3000', // this should match your frontend's origin
  credentials: true, // this allows the backend to accept cookies from the frontend
}

app.use(cors(corsOptions));


// app.use('/auth', authRouter);
app.use('/auth', authRouter);
app.use('/auth', userRouter);
app.use('/file', fileSharingRouter);

//For Unit Testing
app.get('/health-check', (req, res) => {
    console.log(req.cookies.jwt);
    res.sendStatus(200);
});
//start app;
if (!process.env.DATABASE_URI!) {
    console.error('DATABASE_URL not found in environment variables');
    process.exit(1);
  }
  

async function startApp() {
  try {
    await mongoose.connect(process.env.DATABASE_URI!);
    console.log('Connected to MongoDB');
    app.listen(8080, () => {
      console.log('App now listening for requests on port 8080');
    });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

startApp();

