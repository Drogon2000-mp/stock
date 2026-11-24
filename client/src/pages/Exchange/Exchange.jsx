import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";

const inputCls =
  "rounded-lg border border-chalk-200 dark:border-ink-700 bg-white dark:bg-ink-900 px-3 py-2 text-sm focus-ring w-full";

const Exchange = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form state - Customer returns old product
  const [oldProduct, setOldProduct] = useState("");
  const [oldSize, setOldSize] = useState("");
  const [oldColor, setOldColor] = useState("");
  const [oldQuantity, setOldQuantity] = useState(1);

  // New product customer wants
  const [newProduct, setNewProduct] = useState("");
  const [newSize, setNewSize] = useState("");
  const [newColor, setNewColor] = useState("");
  const [newQuantity, setNewQuantity] = useState(1);

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [reason, setReason] = useState("");

  // Available variants for selected products
  const [oldVariants, setOldVariants] = useState([]);
  const [newVariants, setNewVariants] = useState([]);

  useEffect(() => {
    api.get("/products").then((res) => setProducts(res.data));
  }, []);

  // Update variants when product is selected
  useEffect(() => {
    if (oldProduct) {
      const product = products.find((p) => p._id === oldProduct);
      if (product) {
        const variants = product.variants || [];
        setOldVariants(variants);
        if (variants.length > 0) {
          setOldSize(variants[0].size);
          setOldColor(variants[0].color || "");
        }
      }
    }
  }, [oldProduct, products]);

  useEffect(() => {
    if (newProduct) {
      const product = products.find((p) => p._id === newProduct);
      if (product) {
        const variants = product.variants || [];
        setNewVariants(variants);
        if (variants.length > 0) {
          setNewSize(variants[0].size);
          setNewColor(variants[0].color || "");
        }
      }
    }
  }, [newProduct, products]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!oldProduct || !newProduct || !oldSize || !newSize) {
      toast.error("Please select both old and new products with sizes");
      return;
    }

    if (!invoiceNumber) {
      toast.error("Please provide the original invoice number");
      return;
    }

    setLoading(true);
    try {
      await api.post("/exchanges", {
        oldProduct: {
          productId: oldProduct,
          size: oldSize,
          color: oldColor,
          quantity: Number(oldQuantity),
        },
        newProduct: {
          productId: newProduct,
          size: newSize,
          color: newColor,
          quantity: Number(newQuantity),
        },
        invoiceNumber,
        reason,
      });

      toast.success("Exchange processed successfully");
      navigate("/history");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to process exchange");
    } finally {
      setLoading(false);
    }
  };

  const selectedOldProduct = products.find((p) => p._id === oldProduct);
  const selectedNewProduct = products.find((p) => p._id === newProduct);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl">Exchange Product</h1>
        <p className="text-sm text-ink-600 dark:text-chalk-200/60">
          Process customer exchange requests - return old product and issue new product
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Returns (Old Product) */}
        <Card>
          <div className="p-5 border-b border-chalk-200 dark:border-ink-700">
            <h2 className="font-semibold">Customer Returns (Old Product)</h2>
            <p className="text-xs text-ink-600 dark:text-chalk-200/50 mt-1">
              Product being returned by the customer
            </p>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Product</label>
              <select
                value={oldProduct}
                onChange={(e) => setOldProduct(e.target.value)}
                className={inputCls}
                required
              >
                <option value="">Select product to return</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {oldProduct && (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Size</label>
                    <select
                      value={oldSize}
                      onChange={(e) => setOldSize(e.target.value)}
                      className={inputCls}
                      required
                    >
                      {oldVariants.map((v) => (
                        <option key={v._id} value={v.size}>
                          {v.size}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Color (optional)</label>
                    <input
                      type="text"
                      value={oldColor}
                      onChange={(e) => setOldColor(e.target.value)}
                      className={inputCls}
                      placeholder="Color"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Quantity</label>
                    <input
                      type="number"
                      value={oldQuantity}
                      onChange={(e) => setOldQuantity(e.target.value)}
                      className={inputCls}
                      min="1"
                      required
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Customer Receives (New Product) */}
        <Card>
          <div className="p-5 border-b border-chalk-200 dark:border-ink-700">
            <h2 className="font-semibold">Customer Receives (New Product)</h2>
            <p className="text-xs text-ink-600 dark:text-chalk-200/50 mt-1">
              New product being issued to the customer
            </p>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Product</label>
              <select
                value={newProduct}
                onChange={(e) => setNewProduct(e.target.value)}
                className={inputCls}
                required
              >
                <option value="">Select new product</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {newProduct && (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Size</label>
                    <select
                      value={newSize}
                      onChange={(e) => setNewSize(e.target.value)}
                      className={inputCls}
                      required
                    >
                      {newVariants.map((v) => (
                        <option key={v._id} value={v.size}>
                          {v.size}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Color (optional)</label>
                    <input
                      type="text"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      className={inputCls}
                      placeholder="Color"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Quantity</label>
                    <input
                      type="number"
                      value={newQuantity}
                      onChange={(e) => setNewQuantity(e.target.value)}
                      className={inputCls}
                      min="1"
                      required
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Exchange Details */}
        <Card>
          <div className="p-5 border-b border-chalk-200 dark:border-ink-700">
            <h2 className="font-semibold">Exchange Details</h2>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Original Invoice Number *</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className={inputCls}
                placeholder="INV-001"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Reason for Exchange</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className={inputCls}
                rows="3"
                placeholder="Size issue, defect, customer preference, etc."
              />
            </div>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Processing..." : "Process Exchange"}
          </Button>
          <Button variant="outline" type="button" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Exchange;
