const express = require('express');
const router = express.Router();
const favouriteController = require('../controllers/favouriteController');
const auth = require('../middlewares/auth');

router.get('/', auth.required, favouriteController.list);
router.post('/', auth.required, favouriteController.create);
router.delete('/:id', auth.required, favouriteController.remove);

module.exports = router;
