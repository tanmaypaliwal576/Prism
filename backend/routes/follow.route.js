import express from "express";
import db from "../config/db.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* FOLLOW USER ROUTE */
// Allows the logged on user to follow another user (POST /api/follow/:targetId)
router.post("/:targetId", protect, async (req, res) => {
  // `follower_id` is the person who is doing the following (the logged-in user)
  const follower_id = req.user.userId;
  // `following_id` is the person who is being followed
  const following_id = req.params.targetId;

  try {
    // Check if a follow relationship already exists between these two users
    const [existing] = await db.query(
      "SELECT * FROM followers WHERE follower_id = ? AND following_id = ?",
      [follower_id, following_id]
    );

    if (existing.length > 0) {
      return res.json({ message: "Already following" });
    }

    await db.query(
      "INSERT INTO followers (follower_id, following_id) VALUES (?, ?)",
      [follower_id, following_id]
    );

    res.json({ message: "Followed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/* UNFOLLOW USER ROUTE */
// Allows the logged on user to unfollow another user (DELETE /api/follow/:targetId)
router.delete("/:targetId", protect, async (req, res) => {
  // `follower_id` is the person who is requesting to unfollow
  const follower_id = req.user.userId;
  // `following_id` is the person to be unfollowed
  const following_id = req.params.targetId;

  try {
    // Delete the existing row from the followers table
    await db.query(
      "DELETE FROM followers WHERE follower_id = ? AND following_id = ?",
      [follower_id, following_id]
    );

    res.json({ message: "Unfollowed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/* GET FOLLOWING LIST ROUTE */
// Returns a list of user IDs that a specific user is following (GET /api/follow/following/:userId)
router.get("/following/:userId", protect,async (req, res) => {
  // Identify the user whose following list is being requested
  const userId = req.params.userId;

  try {
    // Query the 'followers' table for everyone this user follows
    const [rows] = await db.query(
      "SELECT following_id FROM followers WHERE follower_id = ?",
      [userId]
    );

    res.json(rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });

  }

});

export default router;