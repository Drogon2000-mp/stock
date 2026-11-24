import Product from "../models/Product.js";
import InventoryHistory from "../models/InventoryHistory.js";

// @desc    Process product exchange
// @route   POST /api/exchanges
// @access  Private/Admin
export const processExchange = async (req, res) => {
  const { oldProduct, newProduct, invoiceNumber, reason } = req.body;

  if (!oldProduct || !newProduct || !invoiceNumber) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Validate products and variants exist
  const oldProd = await Product.findById(oldProduct.productId);
  const newProd = await Product.findById(newProduct.productId);

  if (!oldProd || !newProd) {
    return res.status(404).json({ message: "Product not found" });
  }

  const oldVariant = oldProd.variants.find(
    (v) => v.size === oldProduct.size && (!oldProduct.color || v.color === oldProduct.color)
  );
  const newVariant = newProd.variants.find(
    (v) => v.size === newProduct.size && (!newProduct.color || v.color === newProduct.color)
  );

  if (!oldVariant || !newVariant) {
    return res.status(400).json({ message: "Product variant not found" });
  }

  // Check if new product has enough stock
  if (newVariant.quantity < newProduct.quantity) {
    return res.status(400).json({
      message: `Insufficient stock for ${newProd.name} ${newProduct.size}. Available: ${newVariant.quantity}`,
    });
  }

  // Process exchange:
  // 1. Add old product back to inventory (customer returns it)
  oldVariant.quantity += Number(oldProduct.quantity);
  const oldBeforeQty = oldVariant.quantity - Number(oldProduct.quantity);
  const oldAfterQty = oldVariant.quantity;

  // 2. Remove new product from inventory (customer receives it)
  newVariant.quantity -= Number(newProduct.quantity);
  const newBeforeQty = newVariant.quantity + Number(newProduct.quantity);
  const newAfterQty = newVariant.quantity;

  await oldProd.save();
  await newProd.save();

  // Create inventory history records for both movements
  const oldProductDetails = `${oldProd.name} ${oldProduct.size}${oldProduct.color ? " · " + oldProduct.color : ""}`;
  const newProductDetails = `${newProd.name} ${newProduct.size}${newProduct.color ? " · " + newProduct.color : ""}`;

  // Record 1: Old product returned (increases inventory)
  await InventoryHistory.create({
    date: new Date(),
    product: oldProd._id,
    productName: oldProd.name,
    size: oldProduct.size,
    color: oldProduct.color || null,
    type: "EXCHANGE",
    beforeQuantity: oldBeforeQty,
    changedQuantity: Number(oldProduct.quantity),
    afterQuantity: oldAfterQty,
    updatedBy: req.user._id,
    invoiceNumber,
    exchangedFrom: newProd._id,
    exchangedFromDetails: newProductDetails,
    unitPrice: oldProd.price,
    totalValue: oldProd.price * Number(oldProduct.quantity),
    reason: reason || `Exchanged from ${newProductDetails}`,
    remarks: `Customer returned - Exchanged for ${newProductDetails}`,
  });

  // Record 2: New product issued (decreases inventory)
  await InventoryHistory.create({
    date: new Date(),
    product: newProd._id,
    productName: newProd.name,
    size: newProduct.size,
    color: newProduct.color || null,
    type: "EXCHANGE",
    beforeQuantity: newBeforeQty,
    changedQuantity: -Number(newProduct.quantity),
    afterQuantity: newAfterQty,
    updatedBy: req.user._id,
    invoiceNumber,
    exchangedFrom: oldProd._id,
    exchangedFromDetails: oldProductDetails,
    unitPrice: newProd.price,
    totalValue: newProd.price * Number(newProduct.quantity),
    reason: reason || `Exchanged to ${oldProductDetails}`,
    remarks: `Customer received - Exchanged from ${oldProductDetails}`,
  });

  res.status(201).json({
    message: "Exchange processed successfully",
    exchange: {
      returned: oldProductDetails,
      issued: newProductDetails,
      invoiceNumber,
    },
  });
};
