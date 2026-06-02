import express from "express";
import {
  updateUserRole,
  getUsers,
  getUser,
  deleteUser,
  lockUser,
  banUser,
  getUserMessages,
} from "../controllers/adminController.js";
import { protectRoute, allowRoles } from "../middleware/authMiddleware.js";
import { arcjetProtection } from "../middleware/arcjetMiddleware.js";

const router = express.Router();

router.use(arcjetProtection);
router.use(protectRoute);
router.use(allowRoles("admin", "owner"));

router.put("/update-role", updateUserRole);
router.get("/users", getUsers);
router.get("/user/:userId", getUser);
router.delete("/user/:userId", deleteUser);
router.patch("/user/:userId/lock", lockUser);
router.patch("/user/:userId/ban", banUser);
router.get("/user/:userId/messages", getUserMessages);

export default router;