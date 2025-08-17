import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import { getUsers, getMessages, sendMessage } from "../controllers/messageController.js";

const router = express.Router();

router.get("/users", protectRoute, getUsers);
router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, sendMessage);

export default router;