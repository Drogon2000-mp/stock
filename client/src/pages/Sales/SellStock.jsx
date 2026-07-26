import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LuPlus, LuTrash2 } from "react-icons/lu";
import api from "../../api/axios";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const inputCls =
  "w-full rounded-lg border border-chalk-200 dark:border-ink-700 bg-white dark:bg-ink-900 px-3 py-2 text-sm focus-ring";

const SellStock = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [customer, setCustomer] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [remarks, setRemarks] = useState("");

  const [productId, setProductId] = useState(params.get("product") || "");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/products").then((res) => setProducts(res.data));
  }, []);

  const selectedProduct = products.find((p) => p._id === productId);
  const sizeOptions = selectedProduct
    ? [...new Set(selectedProduct.variants.map((v) => v.size))].sort((a, b) => Number(a) - Number(b))
    : [];
  const colorOptions = selectedProduct?.hasColors
    ? selectedProduct.variants.filter((v) => v.size === size).map((v) => v.color)
    : [];

  const addLine = () => {
    if (!selectedProduct || !size || !quantity) return toast.error("Choose a product, size and quantity");
    if (selectedProduct.hasColors && !color) return toast.error("Choose a colour");

    const variant = selectedProduct.variants.find(
      (v) => v.size === size && (v.color || null) === (selectedProduct.hasColors ? color : null)
    );

    setCart((c) => [
      ...c,
      {
        product: selectedProduct._id,
        productName: selectedProduct.name,
        size,
        color: selectedProduct.hasColors ? color : null,
        quantity: Number(quantity),
        available: variant?.currentStock ?? 0,
      },
    ]);
    setSize("");
    setColor("");
    setQuantity(1);
  };

  const removeLine = (idx) => setCart((c) => c.filter((_, i) => i !== idx));

  const submit = async () => {
    if (!invoiceNumber) return toast.error("Invoice number is required");
    if (cart.length === 0) return toast.error("Add at least one size/quantity line");

    setSaving(true);
    try {
      await api.post("/sales", {
        invoiceNumber,
        customer,
        date,
        remarks,
        items: cart.map(({ product, size, color, quantity }) => ({ product, size, color, quantity })),
      });
      toast.success("Sale saved and stock updated");
      navigate("/sales/history");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save sale");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl">Sell Stock</h1>
        <p className="text-sm text-ink-600 dark:text-chalk-200/60">
          Record a sale across one or more sizes. Stock updates automatically once saved.
        </p>
      </div>

      <Card className="p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Invoice Number</label>
            <input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} className={inputCls} placeholder="INV-1042" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Customer (optional)</label>
            <input value={customer} onChange={(e) => setCustomer(e.target.value)} className={inputCls} placeholder="Walk-in customer" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Remarks</label>
            <input value={remarks} onChange={(e) => setRemarks(e.target.value)} className={inputCls} placeholder="Optional note" />
          </div>
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <h2 className="font-display text-lg">Add Items</h2>
        <div className="grid sm:grid-cols-4 gap-3">
          <select
            value={productId}
            onChange={(e) => {
              setProductId(e.target.value);
              setSize("");
              setColor("");
            }}
            className={inputCls}
          >
            <option value="">Product</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>

          <select value={size} onChange={(e) => setSize(e.target.value)} className={inputCls} disabled={!selectedProduct}>
            <option value="">Size</option>
            {sizeOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {selectedProduct?.hasColors ? (
            <select value={color} onChange={(e) => setColor(e.target.value)} className={inputCls} disabled={!size}>
              <option value="">Colour</option>
              {colorOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          ) : (
            <div />
          )}

          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className={inputCls}
            placeholder="Qty"
          />
        </div>
        <Button variant="secondary" onClick={addLine}>
          <LuPlus size={16} /> Add More
        </Button>

        {cart.length > 0 && (
          <table className="w-full text-sm mt-2">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink-600 dark:text-chalk-200/50 border-b border-chalk-200 dark:border-ink-700">
                <th className="pb-2 font-medium">Product</th>
                <th className="pb-2 font-medium">Size</th>
                <th className="pb-2 font-medium">Colour</th>
                <th className="pb-2 font-medium text-right">Qty</th>
                <th className="pb-2 font-medium text-right">Available</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cart.map((line, i) => (
                <tr key={i} className="border-b border-chalk-100 dark:border-ink-800 last:border-0">
                  <td className="py-2">{line.productName}</td>
                  <td className="py-2">{line.size}</td>
                  <td className="py-2">{line.color || "—"}</td>
                  <td className="py-2 text-right font-mono">{line.quantity}</td>
                  <td className={`py-2 text-right font-mono ${line.available < line.quantity ? "text-thread-500" : ""}`}>
                    {line.available}
                  </td>
                  <td className="py-2 text-right">
                    <button onClick={() => removeLine(i)} className="text-ink-600 dark:text-chalk-200/50 hover:text-thread-500 focus-ring rounded">
                      <LuTrash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <div className="flex justify-end">
        <Button onClick={submit} disabled={saving}>
          {saving ? "Saving..." : "Save Sale"}
        </Button>
      </div>
    </div>
  );
};

export default SellStock;
