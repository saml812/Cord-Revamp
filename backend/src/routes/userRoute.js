import express from "express";
import { updateProfile, updatePassword, updateProfilePicture } from "../controllers/userController.js";
import { protectRoute, allowRoles } from "../middleware/authMiddleware.js";
import { arcjetProtection } from "../middleware/arcjetMiddleware.js";

const router = express.Router();

router.use(arcjetProtection, protectRoute);

router.put("/profile", allowRoles("user", "admin"), updateProfile);
router.put("/password", allowRoles("user", "admin"), updatePassword);
router.put("/profile-picture", allowRoles("user", "admin"), updateProfilePicture);

export default router;