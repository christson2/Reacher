const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middlewares/auth');

router.get('/', postController.list);
router.get('/:id', postController.get);
router.post('/', auth.required, postController.create);
router.put('/:id', auth.required, postController.update);
router.delete('/:id', auth.required, postController.remove);

module.exports = router;
