const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userController');
const validation = require('../middlewares/validation');
const upload = require('../middlewares/upload');

// Accept optional avatar file during signup via multipart/form-data
router.post('/signup', upload.single('avatar'), validation.signupRules(), validation.validate, userCtrl.signup);
router.post('/login', validation.loginRules(), validation.validate, userCtrl.login);

module.exports = router;
