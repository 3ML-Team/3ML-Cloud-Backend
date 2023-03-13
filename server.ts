import express, { Router, Request, Response } from 'express';
import authRouter from './routes/auth-routes';
import indexRouter from './routes/index-routes';
import mongoose from 'mongoose';
import "dotenv/config";
import setupPassport from './util/passport-setup';
import passport, { Passport } from 'passport';
setupPassport(passport);
var cookieParser = require('cookie-parser');
var logger = require('morgan');



const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);


const app = express();

const store = new MongoDBStore({
    uri: process.env.DATABASE_URI,
    collection: 'sessions'
  });

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: store,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
  }));


// Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());



app.use('/', indexRouter);
app.use('/auth', authRouter);

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

