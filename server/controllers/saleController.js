import mongoose from "mongoose";
import Product from "../models/Product.js";
import Sale from "../models/Sale.js";
import InventoryHistory from "../models/InventoryHistory.js";

// @desc    Record a sale. Supports multiple sizes/colours of the SAME product
//          (or a mixed cart, since each item carries its own product id) in a
//          single transaction. Stock is decremented atomically and can never
//          go below zero.
// @route   POST /api/sales
// @access  Private/Admin
export const createSale = async (req, res) => {
  const { invoiceNumber, customer, date, remarks, items } = req.body;
  // items: [{ product, size, color, quantity }]

  if (!invoiceNumber) return res.status(400).json({ message: "Invoice number is required" });
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "At least one size/quantity line is required" });
  }

  const existingInvoice = await Sale.findOne({ invoiceNumber });
  if (existingInvoice) return res.status(400).json({ message: "This invoice number has already been used" });

  const session = await mongoose.startSession();
  try {
    let sale;

    await session.withTransaction(async () => {
      const saleItems = [];
      const historyDocs = [];
      // Cache products fetched within this transaction so multiple lines for
      // the same product all read/write the same in-memory document.
      const productCache = new Map();

      for (const item of items) {
        let product = productCache.get(String(item.product));
        if (!product) {
          product = await Product.findById(item.product).session(session);
          if (!product) throw new Error("One of the selected products could not be found");
          productCache.set(String(item.product), product);
        }

        const variant = product.variants.find(
          (v) => v.size === item.size && (v.color || null) === (product.hasColors ? item.color || null : null)
        );
        if (!variant) throw new Error(`No matching size/colour "${item.size} ${item.color || ""}" on ${product.name}`);
        if (!item.quantity || item.quantity <= 0) throw new Error("Quantity must be greater than zero");

        // HARD RULE: never allow stock to go negative.
        if (variant.currentStock < item.quantity) {
          throw new Error(
            `Not enough stock for ${product.name} (${item.size}${item.color ? " " + item.color : ""}). Available: ${variant.currentStock}, requested: ${item.quantity}`
          );
        }

        const before = variant.currentStock;
        variant.currentStock -= item.quantity;
        variant.totalSold += item.quantity;

        saleItems.push({
          product: product._id,
          productName: product.name,
          size: variant.size,
          color: variant.color,
          quantity: item.quantity,
          beforeStock: before,
          afterStock: variant.currentStock,
        });

        historyDocs.push({
          date: date ? new Date(date) : new Date(),
          product: product._id,
          productName: product.name,
          size: variant.size,
          color: variant.color,
          type: "SALE",
          beforeQuantity: before,
          changedQuantity: -item.quantity,
          afterQuantity: variant.currentStock,
          updatedBy: req.user._id,
          invoiceNumber,
          remarks: remarks || "",
          unitPrice: product.price,
          totalValue: product.price * item.quantity,
        });
      }

      // Persist every touched product
      for (const product of productCache.values()) {
        await product.save({ session });
      }

      const totalQuantity = saleItems.reduce((sum, i) => sum + i.quantity, 0);

      const created = await Sale.create(
        [
          {
            invoiceNumber,
            customer: customer || "",
            date: date ? new Date(date) : new Date(),
            items: saleItems,
            totalQuantity,
            remarks: remarks || "",
            createdBy: req.user._id,
          },
        ],
        { session }
      );
      sale = created[0];

      await InventoryHistory.insertMany(historyDocs, { session });
    });

    res.status(201).json({ message: "Sale recorded successfully", sale });
  } catch (error) {
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

// @desc    List sales with date-range and search filters
// @route   GET /api/sales
// @access  Private
export const getSales = async (req, res) => {
  const { range, from, to, invoiceNumber, customer, product, page = 1, limit = 20 } = req.query;
  const filter = {};

  const now = new Date();
  if (range === "today") {
    filter.date = { $gte: new Date(now.setHours(0, 0, 0, 0)) };
  } else if (range === "yesterday") {
    const start = new Date(now);
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    filter.date = { $gte: start, $lte: end };
  } else if (range === "week") {
    const start = new Date(now);
    start.setDate(start.getDate() - 7);
    filter.date = { $gte: start };
  } else if (range === "month") {
    const start = new Date(now);
    start.setDate(start.getDate() - 30);
    filter.date = { $gte: start };
  } else if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }

  if (invoiceNumber) filter.invoiceNumber = { $regex: invoiceNumber, $options: "i" };
  if (customer) filter.customer = { $regex: customer, $options: "i" };
  if (product) filter["items.productName"] = { $regex: product, $options: "i" };

  const skip = (Number(page) - 1) * Number(limit);

  const [sales, total] = await Promise.all([
    Sale.find(filter).sort({ date: -1 }).skip(skip).limit(Number(limit)).populate("createdBy", "name"),
    Sale.countDocuments(filter),
  ]);

  res.json({ sales, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
};

// @desc    Get a single sale
// @route   GET /api/sales/:id
// @access  Private
export const getSaleById = async (req, res) => {
  const sale = await Sale.findById(req.params.id).populate("createdBy", "name");
  if (!sale) return res.status(404).json({ message: "Sale not found" });
  res.json(sale);
};
