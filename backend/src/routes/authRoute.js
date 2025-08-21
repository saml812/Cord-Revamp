import express from "express";
import { checkAuth, login, logout, signup } from "../controllers/authController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes (no authentication required)
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// Protected route (authentication required)
router.get("/check", protectRoute, checkAuth);

export default router;