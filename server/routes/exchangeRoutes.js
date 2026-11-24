import express from "express";
import { processExchange } from "../controllers/exchangeController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, authorize("admin"), processExchange);

export default router;
