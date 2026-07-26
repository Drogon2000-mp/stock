import express from "express";
import { registerUser, loginUser, getMe } from "../controllers/authController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", protect, authorize("admin"), registerUser); // admin creates staff/admin accounts
router.get("/me", protect, getMe);

export default router;
