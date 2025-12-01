const express = require('express');
const router = express.Router();
const accountSwitchLogController = require('../controllers/accountSwitchLogController');
const auth = require('../middlewares/auth');

router.get('/', auth.required, accountSwitchLogController.list);

module.exports = router;
