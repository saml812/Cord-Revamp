import express from "express";
import { updateUserRole, getUsers, deleteUser } from "../controllers/adminController.js";
import { protectRoute, allowRoles } from "../middleware/authMiddleware.js";
import { arcjetProtection } from "../middleware/arcjetMiddleware.js";

const router = express.Router();

router.use(arcjetProtection);
router.use(protectRoute);
router.use(allowRoles("admin"));

router.put("/update-role", updateUserRole);
router.get("/users", getUsers);
router.delete("/user/:userId", deleteUser);

export default router;