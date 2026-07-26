import express from "express";
import { createSale, getSales, getSaleById } from "../controllers/saleController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", getSales);
router.get("/:id", getSaleById);
router.post("/", authorize("admin"), createSale);

export default router;
