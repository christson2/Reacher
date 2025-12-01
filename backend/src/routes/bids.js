const express = require('express');
const router = express.Router();
const bidCtrl = require('../controllers/bidController');
const auth = require('../middlewares/auth');

router.get('/:id', auth.optional, bidCtrl.getBid);
router.post('/', auth.required, bidCtrl.submitBid);
router.put('/:id', auth.required, bidCtrl.updateBid);
router.delete('/:id', auth.required, bidCtrl.deleteBid);

router.get('/request/:request_id', auth.optional, bidCtrl.listByRequest);

module.exports = router;
