import mongoose from "mongoose";

// A "variant" is one sellable unit of a product: a size, optionally combined
// with a colour (e.g. House Dress / Red / Size 24).
const variantSchema = new mongoose.Schema(
  {
    size: { type: String, required: true, trim: true },
    color: { type: String, default: null, trim: true }, // null when product has no colours
    openingStock: { type: Number, required: true, default: 0, min: 0 },
    currentStock: { type: Number, required: true, default: 0, min: 0 },
    totalSold: { type: Number, default: 0, min: 0 },
    totalAdded: { type: Number, default: 0, min: 0 },
    // Per-variant reorder threshold; falls back to the LOW_STOCK_THRESHOLD env
    // var (same default the product-level lowStockThreshold uses) if unset.
    reorderLevel: { type: Number, default: () => Number(process.env.LOW_STOCK_THRESHOLD) || 5, min: 0 },
    active: { type: Boolean, default: true },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true }, // e.g. "Half Pant"
    category: {
      type: String,
      required: true,
      enum: ["Half Pant", "Jacket", "Sweater", "House Dress", "Track Suit", "Shoes", "Other"],
      default: "Other",
    },
    gender: { type: String, enum: ["Male", "Female", "Unisex"], default: "Unisex" },
    hasColors: { type: Boolean, default: false },
    lowStockThreshold: { type: Number, default: () => Number(process.env.LOW_STOCK_THRESHOLD) || 5 },
    isActive: { type: Boolean, default: true },
    variants: [variantSchema],
  },
  { timestamps: true }
);

// Convenience virtuals used across the dashboard / product page
productSchema.virtual("currentStockTotal").get(function () {
  return this.variants.reduce((sum, v) => sum + v.currentStock, 0);
});

productSchema.virtual("totalSold").get(function () {
  return this.variants.reduce((sum, v) => sum + v.totalSold, 0);
});

productSchema.virtual("totalAdded").get(function () {
  return this.variants.reduce((sum, v) => sum + v.totalAdded, 0);
});

productSchema.virtual("openingStockTotal").get(function () {
  return this.variants.reduce((sum, v) => sum + v.openingStock, 0);
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

export default mongoose.model("Product", productSchema);
