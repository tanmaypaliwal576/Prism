import express from "express";
import pool from "../config/db.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* GET COMMENTS FOR A POST ROUTE */
// Endpoint to fetch all comments associated with a specific post (GET /api/comments/:postId)
router.get("/:postId", protect, async (req, res) => {
  try {
    // Extract the post ID from the URL parameters
    const { postId } = req.params;

    // Fetch comments and join with the users table to get the commenter's profile details
    const [comments] = await pool.query(
      `SELECT c.comment_id, c.comment_text, c.created_at, u.user_id, u.username, u.profile_picture 
       FROM comments c
       JOIN users u ON c.user_id = u.user_id
       WHERE c.post_id = ?
       ORDER BY c.created_at ASC`,
      [postId]
    );

    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
});

/* ADD A COMMENT ROUTE */
// Endpoint to create a new comment on a specific post (POST /api/comments/:postId)
router.post("/:postId", protect, async (req, res) => {
  try {
    // Determine which post is being commented on
    const { postId } = req.params;
    // Extract the comment content from the request body
    const { text } = req.body;
    // Get the commenter's user ID from the JWT token
    const userId = req.user.userId;

    // Validate that the comment is neither completely empty nor just spaces
    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Comment text cannot be empty" });
    }

    // Insert the new comment into the database table 'comments'
    const [result] = await pool.query(
      "INSERT INTO comments (post_id, user_id, comment_text) VALUES (?, ?, ?)",
      [postId, userId, text]
    );

    // Fetch the newly created comment object to gracefully return to frontend
    const [newComment] = await pool.query(
      `SELECT c.comment_id, c.comment_text, c.created_at, u.user_id, u.username, u.profile_picture 
       FROM comments c
       JOIN users u ON c.user_id = u.user_id
       WHERE c.comment_id = ?`,
      [result.insertId]
    );

    res.status(201).json(newComment[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to post comment" });
  }
});

export default router;