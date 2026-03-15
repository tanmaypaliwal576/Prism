import express from "express";
import pool from "../config/db.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* TOGGLE SAVE POST ROUTE */
// Allows a user to save or unsave a post (POST /api/saved/:postId)
router.post("/:postId", protect, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    // Check if the user has already saved this post
    const [existing] = await pool.query(
      "SELECT save_id FROM saved_posts WHERE post_id = ? AND user_id = ?",
      [postId, userId]
    );

    if (existing.length > 0) {
      // Unsave
      await pool.query(
        "DELETE FROM saved_posts WHERE post_id = ? AND user_id = ?",
        [postId, userId]
      );
      res.json({ action: "unsaved" });
    } else {
      // Save
      await pool.query(
        "INSERT INTO saved_posts (post_id, user_id) VALUES (?, ?)",
        [postId, userId]
      );
      res.json({ action: "saved" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Save toggle failed" });
  }
});

/* GET SAVED POSTS ROUTE */
// Fetches all the posts that the logged in user has saved (GET /api/saved/)
router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Retrieve saved posts along with the post author's info and whether the current user liked it
    const [posts] = await pool.query(
      `SELECT p.post_id, p.caption, p.image_url, p.created_at, u.username, u.profile_picture,
              (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.post_id) AS like_count,
              (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.post_id AND l.user_id = ?) AS is_liked_by_user,
              1 AS is_saved_by_user
       FROM saved_posts sp
       JOIN posts p ON sp.post_id = p.post_id
       JOIN users u ON p.user_id = u.user_id
       WHERE sp.user_id = ?
       ORDER BY sp.created_at DESC`,
      [userId, userId]
    );

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch saved posts" });
  }
});

export default router;
