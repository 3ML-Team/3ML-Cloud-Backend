import express from 'express';
import indexRouter from './routes/index';
import fileRouter from './routes/file'

const app = express();

app.use('/', indexRouter);
app.use('/file', fileRouter);


app.listen(process.env.PORT || '8080');

