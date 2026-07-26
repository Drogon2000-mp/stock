import Product from "../models/Product.js";
import Sale from "../models/Sale.js";
import InventoryHistory from "../models/InventoryHistory.js";

// @desc    Summary numbers + recent activity for the dashboard
// @route   GET /api/dashboard/summary
// @access  Private
export const getDashboardSummary = async (req, res) => {
  const products = await Product.find({ isActive: true });

  let totalCurrentStock = 0;
  let lowStockItems = 0;
  let outOfStockItems = 0;

  for (const p of products) {
    for (const v of p.variants) {
      totalCurrentStock += v.currentStock;
      if (v.currentStock === 0) outOfStockItems += 1;
      else if (v.currentStock < (p.lowStockThreshold || 5)) lowStockItems += 1;
    }
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [soldTodayAgg, addedTodayAgg, recentSales, recentHistory] = await Promise.all([
    InventoryHistory.aggregate([
      { $match: { type: "SALE", date: { $gte: startOfToday } } },
      { $group: { _id: null, total: { $sum: { $abs: "$changedQuantity" } } } },
    ]),
    InventoryHistory.aggregate([
      { $match: { type: "ADD_STOCK", date: { $gte: startOfToday } } },
      { $group: { _id: null, total: { $sum: "$changedQuantity" } } },
    ]),
    Sale.find().sort({ createdAt: -1 }).limit(5).populate("createdBy", "name"),
    InventoryHistory.find().sort({ createdAt: -1 }).limit(5).populate("updatedBy", "name"),
  ]);

  res.json({
    totalProducts: products.length,
    totalCurrentStock,
    soldToday: soldTodayAgg[0]?.total || 0,
    stockAddedToday: addedTodayAgg[0]?.total || 0,
    lowStockItems,
    outOfStockItems,
    recentSales,
    recentHistory,
  });
};
