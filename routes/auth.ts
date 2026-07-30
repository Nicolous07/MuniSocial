import authMiddleware, { AuthRequest } from "../middleware/authMiddleware.js";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../config/db.js";
const router = express.Router();

// Signup route
router.post("/signup", async (req, res) => {
  try {
    const { full_name, username, email, password } = req.body;

    // Hash password kabla ya kuihifadhi
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql =
      "INSERT INTO users (full_name, username, email, password) VALUES (?, ?, ?, ?)";

    db.query(
      sql,
      [full_name, username, email, hashedPassword],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            message: "Failed to register user",
          });
        }

        res.status(201).json({
          message: "User registered successfully",
        });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});
// Login route
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, results: any) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        message: "Database error",
      });
    }

    if (results.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const user = results[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

   const token = jwt.sign(
  {
    id: user.id,
    email: user.email,
  },
  process.env.JWT_SECRET as string,
  {
    expiresIn: "7d",
  }
);

res.status(200).json({
  message: "Login successful",
  token,
  user: {
    id: user.id,
    full_name: user.full_name,
    username: user.username,
    email: user.email,
  },
});
  });
});
router.get("/me", authMiddleware, (req: AuthRequest, res) => {
  res.status(200).json({
    message: "Protected route accessed successfully",
    user: req.user,
  });
});
export default router;