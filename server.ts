import express, { Router, Request, Response } from 'express';
import indexRouter from './routes/index';

const app = express();

app.use('/', indexRouter);


app.listen(process.env.PORT || '8080');

