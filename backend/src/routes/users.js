const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userController');
const auth = require('../middlewares/auth');
const validation = require('../middlewares/validation');

// Public
router.get('/', auth.optional, userCtrl.listUsers);
router.get('/:id', auth.optional, userCtrl.getUser);

// Protected routes
router.put('/:id', auth.required, validation.userUpdateRules(), validation.validate, userCtrl.updateUser);
router.delete('/:id', auth.required, userCtrl.deleteUser);

module.exports = router;
