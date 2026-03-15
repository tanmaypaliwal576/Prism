import express from "express";
import pool from "../config/db.js";
import { protect } from "../middlewares/auth.middleware.js";
const router = express.Router();

/* TOGGLE LIKE POST ROUTE */
// Allows a user to like or unlike a post (POST /api/likes/:postId)
router.post("/:postId", protect ,async (req, res) => {
  try {
    // ID of the post to be liked/unliked
    const post_id = req.params.postId;
    // ID of the user performing the action
    const user_id = req.user.userId;

    if (!post_id || !user_id) {

      return res.status(400).json({
        message: "post_id and user_id are required"
      });

    }

    /* CHECK IF ALREADY LIKED */
    // See if a like record already exists for this user and this post
    const [existing] = await pool.query(
      "SELECT like_id FROM likes WHERE post_id = ? AND user_id = ?",
      [post_id, user_id]
    );

    // This variable will tell the frontend what happened (liked or unliked)
    let action = "";

    if (existing.length > 0) {
      /* UNLIKE */
      await pool.query(
        "DELETE FROM likes WHERE post_id = ? AND user_id = ?",
        [post_id, user_id]
      );
      action = "unliked";
    } else {

      /* LIKE */

      await pool.query(
        "INSERT INTO likes (post_id, user_id) VALUES (?, ?)",
        [post_id, user_id]
      );

      action = "liked";
    }

    /* GET UPDATED LIKE COUNT */

    const [countResult] = await pool.query(
      "SELECT COUNT(*) AS like_count FROM likes WHERE post_id = ?",
      [post_id]
    );

    res.json({
      action: action,
      like_count: countResult[0].like_count
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Like toggle failed"
    });

  }

});

export default router;