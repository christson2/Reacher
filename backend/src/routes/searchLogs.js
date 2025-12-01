const express = require('express');
const router = express.Router();
const searchLogController = require('../controllers/searchLogController');
const auth = require('../middlewares/auth');

router.get('/', auth.required, searchLogController.list);
router.post('/', auth.optional, searchLogController.create);

module.exports = router;
