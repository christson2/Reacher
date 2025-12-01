const express = require('express');
const router = express.Router();
const reviewCtrl = require('../controllers/reviewController');
const auth = require('../middlewares/auth');

router.post('/', auth.required, reviewCtrl.addReview);
router.get('/:id', auth.optional, reviewCtrl.getReview);
router.put('/:id', auth.required, reviewCtrl.updateReview);
router.delete('/:id', auth.required, reviewCtrl.deleteReview);

// Get reviews for a specific user
router.get('/user/:user_id', auth.optional, reviewCtrl.listForUser);

// Get reviews for a specific appointment
router.get('/appointment/:appointment_id', auth.optional, reviewCtrl.listForAppointment);

// Get user's average rating and review count
router.get('/rating/:user_id', auth.optional, reviewCtrl.getUserRating);

// Get feedback filtered by type (service, appointment, product, general)
router.get('/type/:type', auth.optional, reviewCtrl.listByType);

module.exports = router;
