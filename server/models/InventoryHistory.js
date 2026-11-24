import mongoose from "mongoose";

const MOVEMENT_TYPES = ["SALE", "ADD_STOCK", "RETURN", "ADJUSTMENT", "EXCHANGE"];

const inventoryHistorySchema = new mongoose.Schema(
  {
    date: { type: Date, required: true, default: Date.now },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    size: { type: String, required: true },
    color: { type: String, default: null },
    type: { type: String, enum: MOVEMENT_TYPES, required: true },
    beforeQuantity: { type: Number, required: true },
    changedQuantity: { type: Number, required: true }, // positive for additions, negative for sales
    afterQuantity: { type: Number, required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    invoiceNumber: { type: String, default: null },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", default: null },
    remarks: { type: String, trim: true, default: "" },
    // Exchange specific fields
    exchangedFrom: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
    exchangedFromDetails: { type: String, default: null }, // Store product name, size, color
    unitPrice: { type: Number, default: null },
    totalValue: { type: Number, default: null },
    reason: { type: String, trim: true, default: null }, // Reason for adjustment, return, or exchange
  },
  { timestamps: true }
);

// Immutable ledger: nothing is ever deleted or edited once written.
inventoryHistorySchema.pre("findOneAndUpdate", function (next) {
  next(new Error("Inventory history records are immutable and cannot be updated."));
});

inventoryHistorySchema.index({ date: -1 });
inventoryHistorySchema.index({ product: 1, size: 1, color: 1 });

export const MOVEMENT_TYPES_LIST = MOVEMENT_TYPES;
export default mongoose.model("InventoryHistory", inventoryHistorySchema);
