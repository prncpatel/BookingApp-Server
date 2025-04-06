const express = require('express');
const { requestBooking, getAllBookings } = require('../controllers/bookingController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', verifyToken, getAllBookings);
router.post('/request-booking', verifyToken, requestBooking);

module.exports = router;