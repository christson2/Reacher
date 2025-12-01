const express = require('express');
const router = express.Router();
const productCtrl = require('../controllers/productController');
const auth = require('../middlewares/auth');
const validation = require('../middlewares/validation');

router.get('/', auth.optional, productCtrl.searchProducts);
router.get('/:id', auth.optional, productCtrl.getProduct);

router.post('/', auth.required, validation.productRules(), validation.validate, productCtrl.createProduct);
router.put('/:id', auth.required, validation.productRules(), validation.validate, productCtrl.updateProduct);
router.delete('/:id', auth.required, productCtrl.deleteProduct);

module.exports = router;
