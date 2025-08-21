import express from "express";
import { updateProfile, updatePassword, updateProfilePicture } from "../controllers/userController.js";
import { protectRoute, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.put("/profile", protectRoute, allowRoles("user", "admin"), updateProfile);
router.put("/password", protectRoute, allowRoles("user", "admin"), updatePassword);
router.put("/profile-picture", protectRoute, allowRoles("user", "admin"), updateProfilePicture);

export default router;