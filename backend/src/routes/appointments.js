const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const auth = require('../middlewares/auth');

// Create appointment (requires authentication)
router.post('/', auth.required, appointmentController.createAppointment);

// Get appointment by ID
router.get('/:id', appointmentController.getAppointment);

// Update appointment (requires authentication)
router.put('/:id', auth.required, appointmentController.updateAppointment);

// Delete/cancel appointment (requires authentication)
router.delete('/:id', auth.required, appointmentController.deleteAppointment);

// List appointments for a specific consumer
router.get('/consumer/:consumer_id', appointmentController.listAppointmentsForConsumer);

// List appointments for a specific provider
router.get('/provider/:provider_id', appointmentController.listAppointmentsForProvider);

// Get upcoming appointments for authenticated user
router.get('/me/upcoming', auth.required, appointmentController.getUpcomingAppointments);

// Get past appointments for authenticated user
router.get('/me/past', auth.required, appointmentController.getPastAppointments);

// Confirm appointment (provider action)
router.patch('/:id/confirm', auth.required, appointmentController.confirmAppointment);

// Mark appointment as completed
router.patch('/:id/complete', auth.required, appointmentController.completeAppointment);

module.exports = router;
