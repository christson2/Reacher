const express = require('express');
const router = express.Router();
const profileCtrl = require('../controllers/profileController');
const auth = require('../middlewares/auth');

// Role switching and mode management
router.post('/switch-mode', auth.required, profileCtrl.switchProfileMode);
router.get('/me/current', auth.required, profileCtrl.getCurrentProfile);
router.get('/me/all', auth.required, profileCtrl.getAllUserProfiles);
router.get('/me/completion-status', auth.required, profileCtrl.getProfileCompletionStatus);

// Profile initialization (first-time setup for seller/provider)
router.post('/seller/initialize', auth.required, profileCtrl.initializeSellerProfile);
router.post('/provider/initialize', auth.required, profileCtrl.initializeProviderProfile);

// Profile management
router.put('/update', auth.required, profileCtrl.updateProfile);
router.delete('/:profile_type', auth.required, profileCtrl.deleteProfileByType);

// Get specific profile types
router.get('/type/:profile_type', profileCtrl.getProfilesByType);
router.get('/user/:user_id/type/:profile_type', profileCtrl.getProfileByType);

// Nearby search for sellers and service providers
router.get('/nearby', profileCtrl.getNearbyProfiles);

module.exports = router;
