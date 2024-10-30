import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import emailRouter from './src/routes/email.js';

const app = express();
const port = process.env.PORT || 3004;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), 'public')));
app.use(cookieParser());
app.use(morgan('dev'));


app.use('/emr', emailRouter);


import { connect } from 'mongoose';
connect(process.env.MONGO_DB_URL)
  .then(() => console.log('Connected to MongoDB with Mongoose'))
  .catch(err => console.error('Could not connect to MongoDB', err));
// Serve index.html from public folder
app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});
// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));

// Routes

// app.get('/', (req, res) => {
//   res.render('index', { title: 'InariBox.io' });
// });




// Start the Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
