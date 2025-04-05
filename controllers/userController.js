const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const sendVerificationEmail = require("../utils/emailHandler");
const { authToken } = require("../middlewares/authMiddleware");


const signUp = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
        res.status(400);
        throw Object.assign(new Error("All fields are required!"), { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        res.status(400).json({ message: "User already exists!" });
        throw Object.assign(new Error("User already exists!"), { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const user = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        verificationCode: verificationCode,
    });

    user.save();

    await sendVerificationEmail(email, verificationCode);

    res.status(200).json({ message: 'Signup successful, verification code sent to email' });
});

const verifyEmail = asyncHandler(async (req, res) => {
    const { email, verificationCode } = req.body;
    if (!email || !verificationCode) {
        res.status(400);
        throw Object.assign(new Error("Email and verification code are required!"), { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
        res.status(404);
        throw Object.assign(new Error("User not found!"), { status: 404 });
    }

    if (user.verificationCode !== verificationCode) {
        res.status(400);
        throw Object.assign(new Error("Invalid verification code!"), { status: 400 });
    }

    user.isVerified = true;
    user.verificationCode = null;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400);
        throw Object.assign(new Error("Email and password are required!"), { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
        res.status(401);
        throw Object.assign(new Error("Invalid credentials!"), { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        res.status(401);
        throw Object.assign(new Error("Invalid credentials!"), { status: 401 });
    }

    if (!user.isVerified) {
        res.status(403);
        throw Object.assign(new Error("Email not verified!"), { status: 403 });
    }

    const token = await authToken({ email }); 

    res.status(200).json({ message: 'Login successful', token });
});

module.exports = { signUp, verifyEmail, login };