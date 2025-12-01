const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const auth = require('../middlewares/auth');

router.get('/', jobController.list);
router.get('/:id', jobController.get);
router.post('/', auth.required, jobController.create);
router.put('/:id', auth.required, jobController.update);
router.delete('/:id', auth.required, jobController.remove);

module.exports = router;
