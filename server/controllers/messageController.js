import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

// Get all users except the logged-in user (for the sidebar)
export const getUsersForSidebar = async (req, res) => {
    try {
        const userId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: userId } }).select("-password");

        // Count unseen messages per user
        const unseenMessages = {};
        const promises = filteredUsers.map(async (user) => {
            const messages = await Message.find({
                senderId: user._id,
                receiverId: userId,
                seen: false,
            });
            if (messages.length > 0) {
                unseenMessages[user._id] = messages.length;
            }
        });
        await Promise.all(promises);

        res.status(200).json({ success: true, users: filteredUsers, unseenMessages });
    } catch (error) {
        console.error("getUsersForSidebar error:", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get all messages between the logged-in user and a selected user
export const getMessages = async (req, res) => {
    try {
        const { id: selectedUserId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: selectedUserId },
                { senderId: selectedUserId, receiverId: myId },
            ],
        });

        // Mark messages from the selected user as seen
        await Message.updateMany(
            { senderId: selectedUserId, receiverId: myId },
            { seen: true }
        );

        res.status(200).json({ success: true, messages });
    } catch (error) {
        console.error("getMessages error:", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Mark a specific message as seen — only the receiver can do this
export const markMessageAsSeen = async (req, res) => {
    try {
        const { id } = req.params;
        const myId = req.user._id;

        const message = await Message.findById(id);

        if (!message) {
            return res.status(404).json({ success: false, message: "Message not found" });
        }

        // Security: only the intended receiver can mark a message as seen
        if (message.receiverId.toString() !== myId.toString()) {
            return res.status(403).json({ success: false, message: "Forbidden" });
        }

        await Message.findByIdAndUpdate(id, { seen: true });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("markMessageAsSeen error:", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Send a message (text or image) to a selected user
export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;

        // Must have at least text or image
        if (!text && !image) {
            return res.status(400).json({ success: false, message: "Message cannot be empty" });
        }

        // Validate text length
        if (text && text.length > 2000) {
            return res.status(400).json({ success: false, message: "Message is too long" });
        }

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });

        // Emit the new message to the receiver's socket if they are online
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json({ success: true, newMessage });
    } catch (error) {
        console.error("sendMessage error:", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};