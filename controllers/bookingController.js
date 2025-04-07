const asyncHandler = require("express-async-handler");
const NodeCache = require('node-cache');
const Booking = require("../models/bookingModel");

const cache = new NodeCache({ stdTTL: 10 });

const requestBooking = asyncHandler(async (req, res) => {
    const { email } = req.user;
    if (!email) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { bookingDate, bookingType, bookingSlot, bookingTime } = req.body;
    const conflictQuery = {
        bookingDate,
        $or: [
            { bookingType: 'Full Day' },
            { bookingType: bookingType === 'Full Day' ? { $in: ['Half Day', 'Custom'] } : null },

            bookingType === 'Half Day' ? {
                bookingType: 'Half Day',
                bookingSlot
            } : null,

            (bookingType === 'Custom' && bookingTime < '12:00') ? {
                bookingType: 'Half Day',
                bookingSlot: 'First Half'
            } : null,

            (bookingType === 'Half Day' && bookingSlot === 'First Half') ? {
                bookingType: 'Custom',
                bookingTime: { $lt: '12:00' }
            } : null,

            bookingType === 'Custom' ? {
                bookingType: 'Custom',
                bookingTime
            } : null,
        ].filter(Boolean)
    };

    const conflictExists = await Booking.exists(conflictQuery);
    if (conflictExists) {
        return res.status(400).json({ message: 'Booking conflict. Duplicate or overlapping booking exists.' });
    }

    const booking = await Booking.create({ ...req.body, userEmail: email });
    res.status(201).json(booking);
});

const getAllBookings = asyncHandler(async (req, res) => {
    const { email } = req.user;
    if (!email) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    if (cache.has("bookings")) {
        const cachedBookings = cache.get("bookings");
        return res.status(200).json({
            bookings: cachedBookings
        });
    } else {
        const bookingDetails = await Booking.find({ userEmail: email });
        cache.set("bookings", bookingDetails);
        return res.status(200).json({
            bookings: bookingDetails
        })
    }
})

module.exports = { requestBooking, getAllBookings };