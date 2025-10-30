// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { verifyTokenOnly, refreshAccessToken } = require('../services/authorize');

router.post('/verify', verifyTokenOnly);
router.post('/refresh', refreshAccessToken);

module.exports = router;