const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        match: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
        required: true
    },
    customerName: {
        type: String,
        required: true,
        minlength: 2
    },
    customerEmail: {
        type: String,
        required: true,
        match: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/
    },
    bookingDate: {
        type: Date,
        required: true
    },
    bookingType: {
        type: String,
        enum: ['Full Day', 'Half Day', 'Custom'],
        required: true
    },
    bookingSlot: {
        type: String,
        enum: ['First Half', 'Second Half'],
        required: function () {
            return this.bookingType === "Half Day";
        }
    },
    bookingTime: {
        type: String,
        required: function () {
            return this.bookingType === "Custom";
        }
    }
}, { timestamps: true });

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;