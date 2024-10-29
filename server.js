// server.js

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

const app = express();
const port = process.env.PORT || 3004;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), 'public')));
app.use(cookieParser());
app.use(morgan('dev'));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));

// Routes
app.get('/', (req, res) => {
  res.render('index', { title: 'InariBox' });
});

// Start the Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
