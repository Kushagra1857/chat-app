import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

// Signup a new user
export const signup = async (req, res) => {
    const { fullName, email, password, bio } = req.body;

    try {
        // Validate truly required fields (bio is optional — matches the User model)
        if (!fullName || !email || !password) {
            return res
                .status(400)
                .json({ success: false, message: "Full name, email, and password are required" });
        }

        // Basic length/format validation
        if (fullName.trim().length < 2) {
            return res
                .status(400)
                .json({ success: false, message: "Full name must be at least 2 characters" });
        }
        if (fullName.length > 60) {
            return res
                .status(400)
                .json({ success: false, message: "Full name is too long (max 60 chars)" });
        }
        if (password.length < 6) {
            return res
                .status(400)
                .json({ success: false, message: "Password must be at least 6 characters" });
        }
        if (bio && bio.length > 500) {
            return res
                .status(400)
                .json({ success: false, message: "Bio is too long (max 500 chars)" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res
                .status(409)
                .json({ success: false, message: "Account already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullName: fullName.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            bio: bio?.trim() || "",
        });

        const token = generateToken(newUser._id);

        // Return user data without the password field
        const userResponse = newUser.toObject();
        delete userResponse.password;

        res.status(201).json({
            success: true,
            userData: userResponse,
            token,
            message: "Account created successfully",
        });
    } catch (error) {
        console.error("Signup error:", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Login a user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ success: false, message: "Email and password are required" });
        }

        const userData = await User.findOne({ email: email.trim().toLowerCase() });
        if (!userData) {
            return res
                .status(401)
                .json({ success: false, message: "Invalid credentials" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, userData.password);
        if (!isPasswordCorrect) {
            return res
                .status(401)
                .json({ success: false, message: "Invalid credentials" });
        }

        const token = generateToken(userData._id);

        // Return user data without the password field
        const userResponse = userData.toObject();
        delete userResponse.password;

        res.status(200).json({
            success: true,
            userData: userResponse,
            token,
            message: "Login successful",
        });
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Check if the current token/user is authenticated
export const checkAuth = (req, res) => {
    res.status(200).json({ success: true, user: req.user });
};

// Update user profile details
export const updateProfile = async (req, res) => {
    try {
        const { profilePic, bio, fullName } = req.body;
        const userId = req.user._id;

        // Validate lengths
        if (fullName && fullName.length > 60) {
            return res
                .status(400)
                .json({ success: false, message: "Full name is too long (max 60 chars)" });
        }
        if (bio && bio.length > 500) {
            return res
                .status(400)
                .json({ success: false, message: "Bio is too long (max 500 chars)" });
        }

        let updatedUser;

        if (!profilePic) {
            updatedUser = await User.findByIdAndUpdate(
                userId,
                { bio, fullName },
                { new: true }
            ).select("-password");
        } else {
            const upload = await cloudinary.uploader.upload(profilePic);
            updatedUser = await User.findByIdAndUpdate(
                userId,
                { profilePic: upload.secure_url, bio, fullName },
                { new: true }
            ).select("-password");
        }

        res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
        console.error("Update profile error:", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
