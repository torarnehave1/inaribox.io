// config_routes.js
import dotenv from 'dotenv';
dotenv.config(); // Optional if already called in main server file

import express from 'express';
const router = express.Router();

router.get('/config', (req, res) => {
  res.json({ APPLICATION_LOGO: process.env.APPLICATION_LOGO });
});

export default router;
