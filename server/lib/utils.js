import jwt from "jsonwebtoken";

// Generate a signed JWT token for a user, valid for 7 days
export const generateToken = (userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
    return token;
};