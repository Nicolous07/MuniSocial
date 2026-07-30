import express from "express";
import db from "../config/db.js";
import authMiddleware, { AuthRequest } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, (req: AuthRequest, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({
      message: "Post content is required",
    });
  }

  const sql =
    "INSERT INTO posts (user_id, content) VALUES (?, ?)";

  db.query(
    sql,
    [req.user.id, content],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          message: "Failed to create post",
        });
      }

      res.status(201).json({
        message: "Post created successfully",
      });
    }
  );
});
router.post("/:id/like", authMiddleware, (req: AuthRequest, res) => {
  const postId = req.params.id;
  const userId = req.user.id;

  const sql = "INSERT INTO likes (user_id, post_id) VALUES (?, ?)";

  db.query(sql, [userId, postId], (err) => {
    if (err) {
      console.error(err);

      return res.status(400).json({
        message: "You already liked this post.",
      });
    }

    res.status(201).json({
      message: "Post liked successfully",
    });
  });
});
router.get("/", (req, res) => {
  const sql = `
    SELECT
      posts.id,
      posts.content,
      posts.image,
      posts.created_at,
      users.id AS user_id,
      users.full_name,
      users.username
    FROM posts
    JOIN users
      ON posts.user_id = users.id
    ORDER BY posts.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        message: "Failed to fetch posts",
      });
    }

    res.status(200).json(results);
  });
});
export default router;