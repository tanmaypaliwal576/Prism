import express from "express";
import pool from "../config/db.js";
import upload from "../config/multer.js";
import fs from "fs";
import path from "path";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* CREATE POST WITH IMAGE UPLOAD */
// Endpoint to create a new post (POST /api/posts/create)
// Uses multer middleware 'upload.single("image")' to handle the image file upload
router.post("/create", protect ,upload.single("image"), async (req, res) => {
  try {
    // Extract user ID and caption text from the incoming form data
    const { user_id, caption } = req.body;

    // Validate that a user ID and an image were indeed received
    if (!user_id || !req.file) {
      return res.status(400).json({
        message: "user_id and image are required"
      });
    }

    const image_url = `/uploads/${req.file.filename}`;

    const [result] = await pool.query(
      "INSERT INTO posts (user_id, caption, image_url) VALUES (?, ?, ?)",
      [user_id, caption, image_url]
    );

    res.status(201).json({
      message: "Post created successfully",
      postId: result.insertId,
      image_url: image_url
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Post creation failed"
    });
  }
});

/* GET ALL POSTS (GLOBAL FEED) */
// Fetches the global feed of posts from everyone, unordered or ordered by time (GET /api/posts/feed)
router.get("/feed", protect,async (req, res) => {
  try {
    // Identify who is requesting the feed to see if they've liked/saved posts
    const userId = req.user.userId;

    // Giant query: gets recent posts, author info, total likes, and true/false if current user liked/saved them
    const [posts] = await pool.query(`
      SELECT 
        p.post_id,
        p.user_id,
        p.caption,
        p.image_url,
        u.username,
        u.profile_picture,
        COUNT(l.like_id) AS like_count,
        MAX(CASE WHEN l.user_id = ? THEN 1 ELSE 0 END) AS is_liked_by_user,
        (SELECT COUNT(*) FROM saved_posts s WHERE s.post_id = p.post_id AND s.user_id = ?) AS is_saved_by_user
      FROM posts p
      LEFT JOIN users u 
        ON p.user_id = u.user_id
      LEFT JOIN likes l 
        ON p.post_id = l.post_id
      GROUP BY 
        p.post_id,
        p.user_id,
        p.caption,
        p.image_url,
        u.username,
        u.profile_picture
      ORDER BY p.post_id DESC
    `, [userId, userId]);

    res.json(posts);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Failed to fetch feed"
    });

  }
});
/* PERSONALIZED FEED */
// Fetches posts only from users the logged-in user is following (GET /api/posts/feed/:userId)
router.get("/feed/:userId", protect ,async (req, res) => {
  try {
    // ID of the user requesting their personalized feed
    const userId = req.params.userId;

    // Complex query: Join posts with followers table so we ONLY see posts 
    // where the post author is followed by 'userId'
    const [posts] = await pool.query(
      `SELECT 
          posts.post_id,
          posts.caption,
          posts.image_url,
          posts.created_at,
          users.username,
          COUNT(DISTINCT likes.like_id) AS like_count,
          COUNT(DISTINCT comments.comment_id) AS comment_count,
          (SELECT COUNT(*) FROM likes l WHERE l.post_id = posts.post_id AND l.user_id = ?) AS is_liked_by_user,
          (SELECT COUNT(*) FROM saved_posts s WHERE s.post_id = posts.post_id AND s.user_id = ?) AS is_saved_by_user
       FROM posts
       JOIN followers 
            ON posts.user_id = followers.following_id
       JOIN users 
            ON posts.user_id = users.user_id
       LEFT JOIN likes 
            ON posts.post_id = likes.post_id
       LEFT JOIN comments 
            ON posts.post_id = comments.post_id
       WHERE followers.follower_id = ?
       GROUP BY posts.post_id
       ORDER BY posts.created_at DESC`,
      [userId]
    );

    res.json(posts);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch feed"
    });
  }
});


/* DELETE POST ROUTE */
// Allows a user to delete their own post (DELETE /api/posts/delete/:postId)
router.delete("/delete/:postId", protect ,async (req, res) => {
  try {
    // Identify which post to delete
    const postId = req.params.postId;

    // Find the image path first so we can delete the image file off the server
    const [rows] = await pool.query(
      "SELECT image_url FROM posts WHERE post_id = ?",
      [postId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    const imagePath = rows[0].image_url;

    if (imagePath) {

      const filePath = path.join(process.cwd(), imagePath.replace("/", ""));

      fs.unlink(filePath, (err) => {
        if (err) console.log("Image delete error:", err.message);
      });
    }

    await pool.query(
      "DELETE FROM posts WHERE post_id = ?",
      [postId]
    );

    res.json({
      message: "Post deleted successfully"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Delete failed"
    });
  }
});

export default router;