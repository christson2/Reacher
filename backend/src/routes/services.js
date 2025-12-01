const express = require('express');
const router = express.Router();
const serviceCtrl = require('../controllers/serviceController');
const auth = require('../middlewares/auth');

router.get('/:id', auth.optional, serviceCtrl.getService);
router.get('/', auth.optional, serviceCtrl.searchNearby); // expects lat & lon

router.post('/', auth.required, serviceCtrl.createService);
router.put('/:id', auth.required, serviceCtrl.updateService);
router.delete('/:id', auth.required, serviceCtrl.deleteService);

module.exports = router;
