// Resets the product catalogue to the current size ranges with zero stock.
// Safe to run multiple times: products are upserted by (name, category,
// gender) instead of blindly inserted, so re-running this script never
// creates duplicates - it simply resets every variant back to zero stock.
// Run with: npm run seed
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

dotenv.config();

const REORDER_LEVEL = Number(process.env.LOW_STOCK_THRESHOLD) || 5;

const HOUSE_DRESS_COLORS = ["red", "blue", "green", "yellow"];

// Builds a fresh, zero-stock variant list for a list of sizes.
const zeroVariants = (sizes) =>
  sizes.map((size) => ({
    size: String(size),
    color: null,
    openingStock: 0,
    currentStock: 0,
    totalSold: 0,
    totalAdded: 0,
    reorderLevel: REORDER_LEVEL,
    active: true,
  }));

// Builds variants for every size × color combination.
const colorVariants = (sizes, colors) => {
  const result = [];
  for (const size of sizes) {
    for (const color of colors) {
      result.push({
        size: String(size),
        color,
        openingStock: 0,
        currentStock: 0,
        totalSold: 0,
        totalAdded: 0,
        reorderLevel: REORDER_LEVEL,
        active: true,
      });
    }
  }
  return result;
};

const PRODUCTS = [
  {
    name: "Half Pant",
    category: "Half Pant",
    gender: "Unisex",
    sizes: [18, 20, 22, 24, 26, 28, 30, 32],
  },
  {
    name: "House Dress",
    category: "House Dress",
    gender: "Unisex",
    hasColors: true,
    colors: HOUSE_DRESS_COLORS,
    sizes: [16, 18, 20, 22, 24, 26, 28, 30, 32],
  },
  {
    name: "Jacket",
    category: "Jacket",
    gender: "Unisex",
    sizes: [18, 20, 22, 24, 26, 28, 30, 32],
  },
  // Male Small: shoe numbers 8–13 (step 1)
  {
    name: "Shoes - Male Small",
    category: "Shoes",
    gender: "Male",
    sizes: [8, 9, 10, 11, 12, 13],
  },
  // Male Large: shoe numbers 1–9 (step 1)
  {
    name: "Shoes - Male Large",
    category: "Shoes",
    gender: "Male",
    sizes: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  // Ladies Small: shoe numbers 8–13 (step 1)
  {
    name: "Shoes - Ladies Small",
    category: "Shoes",
    gender: "Female",
    sizes: [8, 9, 10, 11, 12, 13],
  },
  // Ladies Large: shoe numbers 1–9 (step 1)
  {
    name: "Shoes - Ladies Large",
    category: "Shoes",
    gender: "Female",
    sizes: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  {
    name: "Track Suit",
    category: "Track Suit",
    gender: "Unisex",
    sizes: [16, 18, 20, 22, 24, 26, 28, 30, 32],
  },
  {
    name: "Sweater",
    category: "Sweater",
    gender: "Unisex",
    sizes: [24, 26, 28, 30, 32, 34, 36, 38, 40, 42],
  },
];

const seed = async () => {
  await connectDB();

  // Keep any existing admin account/password intact; only create one if
  // it doesn't already exist (avoids duplicating users on re-runs and
  // avoids clobbering a password that may have been changed since).
  const adminEmail = "admin@timetailor.com";
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: "Admin",
      email: adminEmail,
      password: "admin123456789",
      role: "admin",
    });
    console.log(`Created admin user (${adminEmail} / admin123456789)`);
  } else {
    console.log(`Admin user already exists (${adminEmail}) - left untouched`);
  }

  // Remove any legacy shoe products from previous seed runs.
  const legacyShoeNames = ["Shoes", "Shoes (Men)", "Shoes (Women)"];
  const removed = await Product.deleteMany({ name: { $in: legacyShoeNames }, category: "Shoes" });
  if (removed.deletedCount) console.log(`Removed ${removed.deletedCount} legacy shoe product(s)`);

  for (const { name, category, gender, hasColors, colors, sizes } of PRODUCTS) {
    const productColors = colors || null;
    await Product.findOneAndUpdate(
      { name, category, gender },
      {
        $set: {
          name,
          category,
          gender,
          hasColors: !!hasColors,
          lowStockThreshold: REORDER_LEVEL,
          isActive: true,
          variants: hasColors ? colorVariants(sizes, productColors) : zeroVariants(sizes),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );
  }

  console.log(`Seed complete - ${PRODUCTS.length} products reset to zero stock.`);
  console.log(`Login with ${adminEmail} / admin123456789`);
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
