import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  addVariant,
  deleteProduct,
} from "../controllers/productController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", authorize("admin"), createProduct);
router.put("/:id", authorize("admin"), updateProduct);
router.post("/:id/variants", authorize("admin"), addVariant);
router.delete("/:id", authorize("admin"), deleteProduct);

export default router;
