import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    size: { type: String, required: true },
    color: { type: String, default: null },
    quantity: { type: Number, required: true, min: 1 },
    beforeStock: { type: Number, required: true },
    afterStock: { type: Number, required: true },
  },
  { _id: false }
);

const saleSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true, trim: true },
    customer: { type: String, trim: true, default: "" },
    date: { type: Date, required: true, default: Date.now },
    items: { type: [saleItemSchema], validate: (v) => Array.isArray(v) && v.length > 0 },
    totalQuantity: { type: Number, required: true },
    remarks: { type: String, trim: true, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

saleSchema.index({ date: -1 });
saleSchema.index({ customer: 1 });

export default mongoose.model("Sale", saleSchema);
