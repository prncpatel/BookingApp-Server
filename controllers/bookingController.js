const asyncHandler = require("express-async-handler");
const { verifyToken } = require("../middlewares/authMiddleware");
const Booking = require("../models/bookingModel");

const isConflict = async ({ bookingDate, bookingType, bookingSlot, bookingTime }) => {
    const bookings = await Booking.find({ bookingDate });

    for (let existing of bookings) {
        if (existing.bookingType === 'Full Day' || bookingType === 'Full Day') {
            return true;
        }

        if (
            bookingType === 'Half Day' &&
            existing.bookingType === 'Half Day' &&
            existing.bookingSlot === bookingSlot
        ) {
            return true;
        }

        if (
            bookingType === 'Custom' &&
            existing.bookingType === 'Half Day' &&
            existing.bookingSlot === 'First Half' &&
            bookingTime < '12:00'
        ) {
            return true;
        }

        if (
            bookingType === 'Half Day' &&
            existing.bookingType === 'Custom' &&
            existing.bookingTime < '12:00' &&
            bookingSlot === 'First Half'
        ) {
            return true;
        }

        if (
            bookingType === 'Custom' &&
            existing.bookingType === 'Custom' &&
            existing.bookingTime === bookingTime
        ) {
            return true;
        }
    }
    return false;
};


const requestBooking = asyncHandler(async (req, res) => {
    const { email } = req.user;    
    if(!email) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { customerName, customerEmail, bookingDate, bookingType } = req.body;

    if (!customerName || !customerEmail || !bookingDate || !bookingType) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const conflict = await isConflict(req.body);
    if (conflict) {
        return res.status(400).json({ message: 'Booking conflict. Duplicate or overlapping booking exists.' });
    }

    const booking = await Booking.create({ ...req.body, userEmail: email });
    res.status(201).json(booking);
});

const getAllBookings = asyncHandler(async (req, res) => {
    const { email} = req.user;
    if(!email) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const bookingDetails = await Booking.find({ userEmail : email });
    res.status(200).json({
        bookings: bookingDetails
    })
})

module.exports = { requestBooking, getAllBookings };