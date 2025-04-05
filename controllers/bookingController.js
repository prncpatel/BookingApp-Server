const asyncHandler = require("express-async-handler");
const { verifyToken } = require("../middlewares/authMiddleware");
const Booking = require("../models/bookingModel");
const User = require("../models/userModel");

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
    const { authorization } = req.headers;
    if (!authorization) {
        throw Object.assign(new Error("token not provided! Invalid Request"), { status: 400 })
    }
    const tokenDetail = verifyToken(authorization);

    if (!tokenDetail) {
        throw Object.assign(new Error("Invalid Request!"), { status: 400 })
    }

    const { email } = tokenDetail;

    const { customerName, customerEmail, bookingDate, bookingType } = req.body;

    if (!customerName || !customerEmail || !bookingDate || !bookingType) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const conflict = await isConflict(req.body);
    if (conflict) {
        return res.status(400).json({ message: 'Booking conflict. Duplicate or overlapping booking exists.' });
    }

    const booking = new Booking({ ...req.body, userEmail: email });
    await booking.save();
    res.status(201).json(booking);
});

const getAllBookings = asyncHandler(async (req, res) => {
    const { authorization } = req.headers;
    if (!authorization) {
        throw Object.assign(new Error("token not provided! Invalid Request"), { status: 400 })
    }
    const tokenDetail = verifyToken(authorization);

    if (!tokenDetail) {
        throw Object.assign(new Error("Invalid Request!"), { status: 400 })
    }
    const { email } = tokenDetail;
    const bookingDetails = await Booking.find({ userEmail : email });
    res.status(200).json({
        bookings: bookingDetails
    })
})

module.exports = { requestBooking, getAllBookings };