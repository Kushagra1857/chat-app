import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

// Allowed origins — strip trailing slashes defensively to prevent CORS mismatches
const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",").map((o) => o.trim().replace(/\/+$/, ""))
    : ["http://localhost:5173"];

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize Socket.io server with restricted CORS
export const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true,
    },
});

// Store online users: { userId: socketId }
export const userSocketMap = {};

// Socket.io connection handler
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("User Connected:", userId);

    if (userId) userSocketMap[userId] = socket.id;

    // Emit online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("User Disconnected:", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

// Middleware setup
app.use(express.json({ limit: "4mb" }));
app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
        // Explicitly allow the custom 'token' header used for JWT auth
        allowedHeaders: ["Content-Type", "token"],
    })
);

// Routes setup
app.use("/api/status", (req, res) => res.json({ status: "server is live" }));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// Connect to MongoDB
await connectDB();

// Start HTTP server (Render provides PORT env var; fallback to 5000 locally)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Export server (kept for potential serverless adapters)
export default server;
