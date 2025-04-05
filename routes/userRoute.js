const express = require('express');
const { signUp, verifyEmail, login } = require('../controllers/userController');

const router = express.Router();

router.post('/signup', signUp);
router.post('/login', login);
router.post('/verify-email', verifyEmail);

module.exports = router;