const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const auth = require('../middlewares/auth');

router.post('/', contactController.create);
router.get('/', auth.required, contactController.list);
router.get('/:id', auth.required, contactController.get);
router.delete('/:id', auth.required, contactController.remove);

module.exports = router;
