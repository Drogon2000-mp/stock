import express from "express";
import { addStock } from "../controllers/stockController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.post("/in", protect, authorize("admin"), addStock);

export default router;
