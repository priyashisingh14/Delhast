const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// All booking routes require a valid authenticated student session
router.use(authenticateToken);

// Booking CRUD & Feed
router.post('/', bookingController.createBooking);
router.get('/', bookingController.getBookings);
router.get('/:id', bookingController.getBookingById);
router.delete('/:id', bookingController.cancelBooking);
router.post('/:id/cancel', bookingController.cancelBooking);

// Order Acceptance (Atomic) & Lifecycle
router.post('/:id/accept', bookingController.acceptBooking);
router.patch('/:id/status', bookingController.updateBookingStatus);
router.post('/:id/received', bookingController.markBookingReceived);
router.patch('/:id/received', bookingController.markBookingReceived);

// 1-on-1 Order Chat
router.get('/:id/messages', bookingController.getMessages);
router.post('/:id/messages', bookingController.sendMessage);

module.exports = router;
