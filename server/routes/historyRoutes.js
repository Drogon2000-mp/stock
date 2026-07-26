import express from "express";
import { getHistory, getProductHistory } from "../controllers/historyController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", authorize("admin"), getHistory);
router.get("/product/:productId", getProductHistory);

export default router;
