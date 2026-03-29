const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// All paths in this file are prefixed with /api/auth
// Example: POST to /api/auth/signup connects to authController.signup function
router.post('/signup', authController.signup);
router.post('/login', authController.login);

module.exports = router;
