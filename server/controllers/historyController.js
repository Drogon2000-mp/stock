import InventoryHistory from "../models/InventoryHistory.js";

// @desc    List inventory history (the immutable ledger) with filters
// @route   GET /api/history
// @access  Private/Admin
export const getHistory = async (req, res) => {
  const { product, type, from, to, page = 1, limit = 25 } = req.query;
  const filter = {};

  if (product) filter.product = product;
  if (type) filter.type = type;
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [records, total] = await Promise.all([
    InventoryHistory.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("updatedBy", "name")
      .populate("supplier", "name"),
    InventoryHistory.countDocuments(filter),
  ]);

  res.json({ records, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
};

// @desc    Full movement history for a single product (used on the product page)
// @route   GET /api/history/product/:productId
// @access  Private
export const getProductHistory = async (req, res) => {
  const records = await InventoryHistory.find({ product: req.params.productId })
    .sort({ date: -1 })
    .populate("updatedBy", "name");
  res.json(records);
};
