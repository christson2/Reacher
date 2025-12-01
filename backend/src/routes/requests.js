const express = require('express');
const router = express.Router();
const requestCtrl = require('../controllers/requestController');
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const validation = require('../middlewares/validation');

router.get('/:id', auth.optional, requestCtrl.getRequest);
router.get('/', auth.optional, requestCtrl.listNearby); // requires lat & lon

router.post('/', auth.required, upload.array('media', 6), validation.requestRules(), validation.validate, requestCtrl.createRequest);
router.put('/:id', auth.required, upload.array('media', 6), validation.requestRules(), validation.validate, requestCtrl.updateRequest);
router.delete('/:id', auth.required, requestCtrl.deleteRequest);

module.exports = router;
