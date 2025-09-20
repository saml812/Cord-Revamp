import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import {
  getUsers,
  getChatPartners,
  getMessagesByUserId,
  sendMessage,
} from "../controllers/messageController.js";
import { arcjetProtection } from "../middleware/arcjetMiddleware.js";

const router = express.Router();

router.use(arcjetProtection, protectRoute);

router.get("/contacts", getUsers);
router.get("/chats", getChatPartners);
router.get("/:id", getMessagesByUserId);
router.post("/send/:id", sendMessage);

export default router;