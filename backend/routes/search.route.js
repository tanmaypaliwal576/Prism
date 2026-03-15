import express from "express";
import pool from "../config/db.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* SEARCH USERS ROUTE */
// Allows searching for users by their username (GET /api/search/users?q=...)
router.get("/users", protect, async (req, res) => {
  try {
    // Extract the search query parameter 'q' from the URL
    const { q } = req.query;
    if (!q) return res.json([]);
    
    // Look up users whose usernames match the search query (up to 10 results)
    const [users] = await pool.query(
      "SELECT user_id, username, bio, profile_picture FROM users WHERE username LIKE ? LIMIT 10",
      [`%${q}%`]
    );
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Search failed" });
  }
});

/* SEARCH POSTS ROUTE */
// Allows searching for posts by their caption (GET /api/search/posts?q=...)
router.get("/posts", protect, async (req, res) => {
  try {
    // Extract the search query parameter 'q'
    const { q } = req.query;
    if (!q) return res.json([]);
    
    // Search posts where the caption contains the search string
    const [posts] = await pool.query(
      `SELECT p.post_id, p.caption, p.image_url, p.created_at, u.username,
              (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.post_id) AS like_count
       FROM posts p
       JOIN users u ON p.user_id = u.user_id
       WHERE p.caption LIKE ?
       ORDER BY p.created_at DESC LIMIT 10`,
      [`%${q}%`]
    );
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Search failed" });
  }
});

export default router;
