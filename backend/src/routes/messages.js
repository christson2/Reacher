const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const auth = require('../middlewares/auth');

router.get('/', auth.required, messageController.list);
router.get('/:id', auth.required, messageController.get);
router.post('/', auth.required, messageController.create);
router.put('/:id/read', auth.required, messageController.markRead);

module.exports = router;
