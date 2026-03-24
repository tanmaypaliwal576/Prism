import express from "express";
import pool from "../config/db.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

const isAdmin = async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT is_admin FROM users WHERE user_id = ?", [req.user.userId]);
    if (!rows[0]?.is_admin) return res.status(403).json({ message: "Admin access denied" });
    next();
  } catch (error) {
    res.status(500).json({ message: "Admin authorization failed" });
  }
};

router.get("/users", protect, isAdmin, async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT u.user_id, u.name, u.username, u.email, u.profile_picture, u.is_blocked, u.is_admin,
        (SELECT COUNT(*) FROM posts p WHERE p.user_id = u.user_id) AS posts_count,
        (SELECT COUNT(*) FROM followers f WHERE f.following_id = u.user_id) AS followers_count,
        (SELECT COUNT(*) FROM followers f WHERE f.follower_id = u.user_id) AS following_count,
        (SELECT COUNT(*) FROM likes l JOIN posts p ON l.post_id = p.post_id WHERE p.user_id = u.user_id) AS total_likes_received
      FROM users u ORDER BY u.created_at DESC
    `);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
});

router.put("/users/:id/block", protect, isAdmin, async (req, res) => {
  try {
    if (req.params.id == req.user.userId) return res.status(400).json({ message: "You cannot block yourself." });
    
    await pool.query("UPDATE users SET is_blocked = ? WHERE user_id = ?", [req.body.is_blocked, req.params.id]);
    res.json({ message: "User status updated" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update block status" });
  }
});

router.delete("/users/:id", protect, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    if (userId == req.user.userId) return res.status(400).json({ message: "You cannot delete yourself." });
    
    // Clear relations first to prevent foreign key issues
    await pool.query("DELETE FROM likes WHERE user_id = ?", [userId]);
    await pool.query("DELETE FROM saved_posts WHERE user_id = ?", [userId]);
    await pool.query("DELETE FROM comments WHERE user_id = ?", [userId]);
    await pool.query("DELETE FROM followers WHERE follower_id = ? OR following_id = ?", [userId, userId]);
    
    const [posts] = await pool.query("SELECT post_id FROM posts WHERE user_id = ?", [userId]);
    if (posts.length > 0) {
      const pIds = posts.map(p => p.post_id);
      await pool.query("DELETE FROM likes WHERE post_id IN (?)", [pIds]);
      await pool.query("DELETE FROM comments WHERE post_id IN (?)", [pIds]);
      await pool.query("DELETE FROM saved_posts WHERE post_id IN (?)", [pIds]);
    }
    
    await pool.query("DELETE FROM posts WHERE user_id = ?", [userId]);
    await pool.query("DELETE FROM users WHERE user_id = ?", [userId]);
    
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user" });
  }
});

export default router;
