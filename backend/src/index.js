import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import errorHandler from "./middleware/errorHandler.middleware.js";
import { app, server } from "./lib/socket.js";
import path from "path";
import { fileURLToPath } from "url";
// Load environment variables before any other code
dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5001;

// CORS Configuration
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
    exposedHeaders: ["Set-Cookie"],
    preflightContinue: true,
    optionsSuccessStatus: 200
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, '../frontend/dist')));
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend', 'dist', 'index.html'));
    });
}


// Error handling middleware should be last
app.use(errorHandler);

// Start server only after successful database connection
const startServer = async () => {
    try {
        await connectDB();
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();