const express = require('express');
const { requestBooking, getAllBookings } = require('../controllers/bookingController');

const router = express.Router();

router.get('/', getAllBookings);
router.post('/request-booking', requestBooking);

module.exports = router;