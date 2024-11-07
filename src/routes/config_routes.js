// src/routes/config_routes.js
import express from 'express';
import config from '../config/config.js'; // Import the default export

const router = express.Router();

router.get('/application-logo', (req, res) => {
  res.json({ applicationLogo: config.applicationLogo });
});

export default router;