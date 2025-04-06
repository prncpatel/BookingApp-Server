const jwt = require("jsonwebtoken");

const authToken = (payload) => {
    try {
        if (!payload) {
            throw Object.assign(new Error("Payload data required!"))
        }
        return jwt.sign(payload, process.env.JWT_SECRET);
    } catch (error) {
        console.log(`Token not created! ${error}`)
    }
};

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.log(`Token not verified! ${error}`)
    }
}
module.exports = { authToken, verifyToken };