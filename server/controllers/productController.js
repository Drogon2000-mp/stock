import Product from "../models/Product.js";
import InventoryHistory from "../models/InventoryHistory.js";

// @desc    List products (optionally filtered by search / category)
// @route   GET /api/products
// @access  Private
export const getProducts = async (req, res) => {
  const { search, category } = req.query;
  const filter = { isActive: true };

  if (category) filter.category = category;
  if (search) filter.name = { $regex: search, $options: "i" };

  const products = await Product.find(filter).sort({ name: 1 });
  res.json(products);
};

// @desc    Get a single product with full variant breakdown
// @route   GET /api/products/:id
// @access  Private
export const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
};

// @desc    Create a new product, with its initial sizes/colours and opening stock
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  const { name, category, gender, hasColors, lowStockThreshold, variants } = req.body;

  const existing = await Product.findOne({ name });
  if (existing) return res.status(400).json({ message: "A product with this name already exists" });

  const normalisedVariants = (variants || []).map((v) => ({
    size: v.size,
    color: hasColors ? v.color || null : null,
    openingStock: v.openingStock || 0,
    currentStock: v.openingStock || 0,
    totalSold: 0,
    totalAdded: 0,
  }));

  const product = await Product.create({
    name,
    category,
    gender,
    hasColors: !!hasColors,
    lowStockThreshold,
    variants: normalisedVariants,
  });

  // Record the opening stock of every variant in the immutable ledger
  const historyEntries = product.variants.map((v) => ({
    date: new Date(),
    product: product._id,
    productName: product.name,
    size: v.size,
    color: v.color,
    type: "ADJUSTMENT",
    beforeQuantity: 0,
    changedQuantity: v.openingStock,
    afterQuantity: v.openingStock,
    updatedBy: req.user._id,
    remarks: "Opening stock at product creation",
  }));
  if (historyEntries.length) await InventoryHistory.insertMany(historyEntries);

  res.status(201).json(product);
};

// @desc    Update product metadata (name, category, threshold). Stock is NEVER
//          edited here - it can only move through Add Stock / Sell Stock so
//          every change is traceable in the inventory history.
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  const { name, category, gender, lowStockThreshold, isActive } = req.body;

  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  if (name) product.name = name;
  if (category) product.category = category;
  if (gender) product.gender = gender;
  if (lowStockThreshold !== undefined) product.lowStockThreshold = lowStockThreshold;
  if (isActive !== undefined) product.isActive = isActive;

  await product.save();
  res.json(product);
};

// @desc    Add a brand new size/colour variant to an existing product
// @route   POST /api/products/:id/variants
// @access  Private/Admin
export const addVariant = async (req, res) => {
  const { size, color, openingStock } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  const duplicate = product.variants.find(
    (v) => v.size === size && (v.color || null) === (product.hasColors ? color || null : null)
  );
  if (duplicate) return res.status(400).json({ message: "This size/colour combination already exists" });

  product.variants.push({
    size,
    color: product.hasColors ? color || null : null,
    openingStock: openingStock || 0,
    currentStock: openingStock || 0,
  });
  await product.save();

  const newVariant = product.variants[product.variants.length - 1];
  await InventoryHistory.create({
    date: new Date(),
    product: product._id,
    productName: product.name,
    size: newVariant.size,
    color: newVariant.color,
    type: "ADJUSTMENT",
    beforeQuantity: 0,
    changedQuantity: newVariant.currentStock,
    afterQuantity: newVariant.currentStock,
    updatedBy: req.user._id,
    remarks: "New size/colour added",
  });

  res.status(201).json(product);
};

// @desc    Soft-delete a product (kept for historical/reporting integrity)
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  product.isActive = false;
  await product.save();
  res.json({ message: "Product deactivated" });
};
