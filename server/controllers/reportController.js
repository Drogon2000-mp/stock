import InventoryHistory from "../models/InventoryHistory.js";
import Product from "../models/Product.js";

const getRange = (period, from, to) => {
  const now = new Date();
  let start;
  let end = new Date();

  if (period === "daily") {
    start = new Date(now.setHours(0, 0, 0, 0));
  } else if (period === "weekly") {
    start = new Date();
    start.setDate(start.getDate() - 7);
  } else if (period === "monthly") {
    start = new Date();
    start.setDate(start.getDate() - 30);
  } else {
    start = from ? new Date(from) : new Date(0);
    end = to ? new Date(to) : new Date();
  }
  return { start, end };
};

// @desc    Generate a stock movement report for a period
// @route   GET /api/reports
// @access  Private/Admin
export const getReport = async (req, res) => {
  const { period = "daily", from, to } = req.query;
  const { start, end } = getRange(period, from, to);

  const movements = await InventoryHistory.find({ date: { $gte: start, $lte: end } });

  const stockAdded = movements
    .filter((m) => m.type === "ADD_STOCK")
    .reduce((sum, m) => sum + m.changedQuantity, 0);

  const itemsSold = movements
    .filter((m) => m.type === "SALE")
    .reduce((sum, m) => sum + Math.abs(m.changedQuantity), 0);

  const adjustments = movements
    .filter((m) => m.type === "ADJUSTMENT" || m.type === "RETURN")
    .reduce((sum, m) => sum + m.changedQuantity, 0);

  const products = await Product.find({ isActive: true });
  const currentInventory = products.reduce((sum, p) => sum + p.variants.reduce((s, v) => s + v.currentStock, 0), 0);
  const openingStock = currentInventory - stockAdded + itemsSold - adjustments;

  const lowStock = [];
  const outOfStock = [];
  for (const p of products) {
    for (const v of p.variants) {
      if (v.currentStock === 0) outOfStock.push({ product: p.name, size: v.size, color: v.color });
      else if (v.currentStock < (p.lowStockThreshold || 5))
        lowStock.push({ product: p.name, size: v.size, color: v.color, currentStock: v.currentStock });
    }
  }

  res.json({
    period,
    range: { start, end },
    openingStock,
    stockAdded,
    itemsSold,
    closingStock: currentInventory,
    currentInventory,
    lowStock,
    outOfStock,
  });
};
