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

const verifyToken = (authorization) => {
    try {  
        const token = authorization.split(" ")[1];
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        console.log(`Token not verified! ${error}`)
    }
}
module.exports = { authToken, verifyToken };