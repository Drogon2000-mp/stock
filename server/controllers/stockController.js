import mongoose from "mongoose";
import Product from "../models/Product.js";
import InventoryHistory from "../models/InventoryHistory.js";

// @desc    Add stock to one or more size/colour variants of a product
//          (supports adding several sizes in one submission, mirroring the
//          multi-size sell flow)
// @route   POST /api/stock/in
// @access  Private/Admin
export const addStock = async (req, res) => {
  const { product: productId, supplier, date, remarks, items } = req.body;
  // items: [{ size, color, quantity }]

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "At least one size/quantity line is required" });
  }

  const session = await mongoose.startSession();
  try {
    let updatedProduct;
    const historyDocs = [];

    await session.withTransaction(async () => {
      const product = await Product.findById(productId).session(session);
      if (!product) throw new Error("Product not found");

      for (const item of items) {
        const variant = product.variants.find(
          (v) => v.size === item.size && (v.color || null) === (product.hasColors ? item.color || null : null)
        );
        if (!variant) throw new Error(`No matching size/colour "${item.size} ${item.color || ""}" on this product`);
        if (!item.quantity || item.quantity <= 0) throw new Error("Quantity must be greater than zero");

        const before = variant.currentStock;
        variant.currentStock += item.quantity;
        variant.totalAdded += item.quantity;

        historyDocs.push({
          date: date ? new Date(date) : new Date(),
          product: product._id,
          productName: product.name,
          size: variant.size,
          color: variant.color,
          type: "ADD_STOCK",
          beforeQuantity: before,
          changedQuantity: item.quantity,
          afterQuantity: variant.currentStock,
          updatedBy: req.user._id,
          supplier: supplier || null,
          remarks: remarks || "",
          unitPrice: product.price,
          totalValue: product.price * item.quantity,
        });
      }

      await product.save({ session });
      await InventoryHistory.insertMany(historyDocs, { session });
      updatedProduct = product;
    });

    res.status(201).json({ message: "Stock added successfully", product: updatedProduct });
  } catch (error) {
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};
