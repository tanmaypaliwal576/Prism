// --- IMPORTS ---
// express: The core framework for creating our web server and defining routes
import express from "express";
// dotenv: Allows loading environment variables from a .env file (like database credentials)
import dotenv from "dotenv";
// cors: Middleware that allows our frontend (running on a different port/domain) to talk to this backend
import cors from 'cors';

// Import our individual route handlers
import authRoutes from "./routes/auth.route.js";
import postRoutes from "./routes/post.route.js";
import likeRoutes from "./routes/like.route.js";
import commentRoutes from "./routes/comment.route.js";
import followRoutes from "./routes/follow.route.js";
import searchRoutes from "./routes/search.route.js";
import saveRoutes from "./routes/save.route.js"; // IMPORT SAVED ROUTE
import adminRoutes from "./routes/admin.route.js"; // ADMIN ROUTE

// --- CONFIGURATION ---
// Activate dotenv to read our .env file values securely
dotenv.config();

// Initialize the Express application instance
const app = express();

// Middleware to parse incoming JSON payloads (e.g. req.body in POST requests)
app.use(express.json());

// Enable Cross-Origin Resource Sharing (CORS) limits which domains can connect to our API
app.use(cors(
  {
    origin: "*",       // Allow requests from anywhere (can be restricted to frontend URL in prod)
    credentials: true  // Allow sending cookies/tokens with requests
  }
));

// Expose the "uploads" folder statically so uploaded files can be accessed via URL
app.use("/uploads", express.static("uploads"));

// --- ROUTES ---
// Map URL paths to their corresponding route handers imported above
app.use("/api/auth", authRoutes);         // User login/registration routes
app.use("/api/posts", postRoutes);        // Create/read posts routes
app.use("/api/likes", likeRoutes);        // Like logic routes
app.use("/api/comments", commentRoutes);  // Comment logic routes
app.use("/api/follow", followRoutes);     // Follow/unfollow users routes
app.use("/api/search", searchRoutes);     // Search functionality routes
app.use("/api/saved", saveRoutes);        // MOUNT SAVED ROUTE for handling post saving
app.use("/api/admin", adminRoutes);       // Admin analytics and management routes

// --- SERVER INSTANTIATION ---
// Tell the app to listen for incoming requests on port 5000
app.listen(5000, () => {
  // Callback function that runs once the server is successfully running
  console.log("Server running on port 5000");
});