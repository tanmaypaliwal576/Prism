import express from "express";
import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import upload from "../config/multer.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* REGISTER ROUTE */
// Handles creating a new user account (POST /api/auth/register)
router.post("/register", async (req, res) => {
  try {
    // Extract user details from the incoming request body
    const { name, username, email, password } = req.body;

    // Secure the password by hashing it using bcrypt before saving it to the database.
    // The "10" is the salt rounds, defining how complex/slow the hashing will be.
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the 'users' table in the MySQL database
    await pool.query(
      "INSERT INTO users (name, username, email, password) VALUES (?,?,?,?)",
      [name, username, email, hashedPassword]
    );

    res.json({
      message: "User registered successfully"
    });

  } catch (error) {

    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      const msg = (error.sqlMessage || error.message || "").toLowerCase();
      if (msg.includes("username")) {
        return res.status(400).json({ message: "Username already exists", error: "Username already exists" });
      } else if (msg.includes("email")) {
        return res.status(400).json({ message: "Email already exists", error: "Email already exists" });
      }
      return res.status(400).json({ message: "User already exists", error: "User already exists" });
    }
    res.status(500).json({ error: "Registration failed" });

  }
});


/* LOGIN ROUTE */
// Authenticates a user and issues an access token (POST /api/auth/login)
router.post("/login", async (req, res) => {
  try {
    // Extract email and password from request body
    const { email, password } = req.body;

    // Query the database to find a user matching the provided email
    // [rows] extracts just the result rows from the MySQL response
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email=?",
      [email]
    );

    // If no row is returned, the email doesn't exist
    if (rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = rows[0];

    // Compare the provided plain-text password with the hashed password stored in DB
    const isMatch = await bcrypt.compare(password, user.password);

    // If passwords do not match, reject authentication
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    if (user.is_blocked) {
      return res.status(403).json({ message: "Your account has been blocked by an administrator" });
    }

    const token = jwt.sign(
      { userId: user.user_id },
      "secretkey",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token: token,
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        is_admin: user.is_admin === 1 || user.is_admin === true
      }
    });

  } catch (error) {

    console.error(error);
    res.status(500).json({ error: "Login failed" });

  }
});


/* LOGGED IN USER PROFILE ROUTE */
// Fetches the profile data for the currently authenticated user (GET /api/auth/profile)
// The `protect` middleware ensures only logged-in users reach this code
router.get("/profile", protect, async (req, res) => {
  try {
    // Get the user ID from the decoded JWT token (set by protect middleware)
    const userId = req.user.userId;

    // Retrieve basic user info from DB
    const [user] = await pool.query(
      "SELECT name, username, bio, profile_picture, is_admin FROM users WHERE user_id = ?",
      [userId]
    );

    const [postsCount] = await pool.query(
      "SELECT COUNT(*) as count FROM posts WHERE user_id = ?",
      [userId]
    );

    const [followers] = await pool.query(
      "SELECT COUNT(*) as count FROM followers WHERE following_id = ?",
      [userId]
    );

    const [following] = await pool.query(
      "SELECT COUNT(*) as count FROM followers WHERE follower_id = ?",
      [userId]
    );

    const [userPosts] = await pool.query(
      `SELECT post_id, caption, image_url, created_at, 
              (SELECT COUNT(*) FROM likes l WHERE l.post_id = posts.post_id) AS like_count,
              (SELECT COUNT(*) FROM likes l WHERE l.post_id = posts.post_id AND l.user_id = ?) AS is_liked_by_user,
              (SELECT COUNT(*) FROM saved_posts s WHERE s.post_id = posts.post_id AND s.user_id = ?) AS is_saved_by_user
       FROM posts WHERE user_id = ? ORDER BY created_at DESC`,
      [userId, userId, userId]
    );

    res.json({
      id: userId,
      name: user[0].name,
      username: user[0].username,
      handle: "@" + user[0].username.toLowerCase(),
      bio: user[0].bio,
      profile_picture: user[0].profile_picture,
      is_admin: user[0].is_admin === 1 || user[0].is_admin === true,
      postsCount: postsCount[0].count,
      followers: followers[0].count,
      following: following[0].count,
      posts: userPosts
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Profile error" });
  }
});

/* OTHER USER PROFILE */
router.get("/profile/:viewId", protect, async (req, res, next) => {
  try {
    const viewId = req.params.viewId;
    if (viewId === 'edit') return next(); // Fallback for wrong routing

    const [user] = await pool.query(
      "SELECT name, username, bio, profile_picture FROM users WHERE user_id = ?",
      [viewId]
    );

    if (user.length === 0) return res.status(404).json({ message: "User not found" });

    const [postsCount] = await pool.query(
      "SELECT COUNT(*) as count FROM posts WHERE user_id = ?",
      [viewId]
    );

    const [followers] = await pool.query(
      "SELECT COUNT(*) as count FROM followers WHERE following_id = ?",
      [viewId]
    );

    const [following] = await pool.query(
      "SELECT COUNT(*) as count FROM followers WHERE follower_id = ?",
      [viewId]
    );

    const currentUserId = req.user.userId;

    const [userPosts] = await pool.query(
      `SELECT post_id, caption, image_url, created_at, 
              (SELECT COUNT(*) FROM likes l WHERE l.post_id = posts.post_id) AS like_count,
              (SELECT COUNT(*) FROM likes l WHERE l.post_id = posts.post_id AND l.user_id = ?) AS is_liked_by_user,
              (SELECT COUNT(*) FROM saved_posts s WHERE s.post_id = posts.post_id AND s.user_id = ?) AS is_saved_by_user
       FROM posts WHERE user_id = ? ORDER BY created_at DESC`,
      [currentUserId, currentUserId, viewId]
    );

    res.json({
      id: viewId,
      name: user[0].name,
      username: user[0].username,
      handle: "@" + user[0].username.toLowerCase(),
      bio: user[0].bio,
      profile_picture: user[0].profile_picture,
      postsCount: postsCount[0].count,
      followers: followers[0].count,
      following: following[0].count,
      posts: userPosts
    });

  } catch (error) {
    console.error("Profile view error:", error);
    res.status(500).json({ message: "Profile error" });
  }
});

/* EDIT PROFILE ROUTE */
// Allows users to modify their bio and profile picture (POST /api/auth/profile/edit)
// 'upload.single("profile_picture")' middleware processes any image uploaded with the key "profile_picture"
router.post("/profile/edit", protect, upload.single("profile_picture"), async (req, res) => {
  try {
    const userId = req.user.userId;
    // Extract updated fields
    const { bio, username } = req.body;
    
    // Construct dynamic SQL update query. We start with updating the bio.
    let query = "UPDATE users SET bio = ?";
    let params = [bio];

    if (req.file) {
      const profile_picture = `/uploads/${req.file.filename}`;
      query += ", profile_picture = ?";
      params.push(profile_picture);
    }

    query += " WHERE user_id = ?";
    params.push(userId);

    await pool.query(query, params);

    res.json({ message: "Profile updated successfully" });

  } catch (error) {
    console.error("Profile Edit Error:", error);
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.sqlMessage && error.sqlMessage.includes("username")) {
        return res.status(400).json({ message: "Username is already taken" });
      }
      return res.status(400).json({ message: "Duplicate value found" });
    }
    res.status(500).json({ message: error.message || "Profile update failed" });
  }
});


/* SUGGESTED USERS ROUTE */
// Fetches a list of all users and indicates whether the logged-in user follows them (GET /api/auth/all)
router.get("/all", protect, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Search users and perform a LEFT JOIN against the 'followers' table.
    // 'IF' clause generates a boolean flag true/false depending on whether a following record exists.
    // 'WHERE u.user_id != ?' ensures we do not suggest the current user to themselves.
    const [users] = await pool.query(
      `SELECT u.user_id, u.username, u.profile_picture,
              IF(f.follower_id IS NULL, false, true) as is_following
       FROM users u
       LEFT JOIN followers f ON u.user_id = f.following_id AND f.follower_id = ?
       WHERE u.user_id != ?`,
      [userId, userId]
    );

    res.json(users);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

export default router;