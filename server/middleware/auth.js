import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Middleware to protect routes — verifies the JWT token from the request header
export const protectRoute = async (req, res, next) => {
    try {
        const token = req.headers.token;

        if (!token) {
            return res.status(401).json({ success: false, message: "No token provided. Please login." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Auth middleware error:", error.message);
        res.status(401).json({ success: false, message: "Invalid or expired token. Please login again." });
    }
};