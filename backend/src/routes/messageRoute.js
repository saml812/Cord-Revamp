import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import {
  getContacts,
  getChatPartners,
  getMessagesByUserId,
  sendMessage,
} from "../controllers/messageController.js";
import { downloadAttachment } from "../controllers/attachmentController.js";
import { arcjetProtection } from "../middleware/arcjetMiddleware.js";
import multer from "multer";

const router = express.Router();

router.use(arcjetProtection, protectRoute);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

router.get("/contacts", getContacts);
router.get("/chats", getChatPartners);
router.get("/attachments/:id/download", downloadAttachment);
router.get("/:id", getMessagesByUserId);
router.post("/send/:id", upload.single("file"), sendMessage);

export default router;