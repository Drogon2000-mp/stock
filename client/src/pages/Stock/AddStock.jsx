import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LuPlus, LuTrash2 } from "react-icons/lu";
import api from "../../api/axios";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const inputCls =
  "w-full rounded-lg border border-chalk-200 dark:border-ink-700 bg-white dark:bg-ink-900 px-3 py-2 text-sm focus-ring";

const AddStock = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState(params.get("product") || "");
  const [supplier, setSupplier] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [remarks, setRemarks] = useState("");

  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [lines, setLines] = useState([]);
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
    if (!selectedProduct || !size || !quantity) return toast.error("Choose a size and quantity");
    if (selectedProduct.hasColors && !color) return toast.error("Choose a colour");
    setLines((l) => [...l, { size, color: selectedProduct.hasColors ? color : null, quantity: Number(quantity) }]);
    setSize("");
    setColor("");
    setQuantity(1);
  };

  const removeLine = (idx) => setLines((l) => l.filter((_, i) => i !== idx));

  const submit = async () => {
    if (!selectedProduct) return toast.error("Choose a product");
    if (lines.length === 0) return toast.error("Add at least one size/quantity line");

    setSaving(true);
    try {
      await api.post("/stock/in", {
        product: productId,
        supplier,
        date,
        remarks,
        items: lines,
      });
      toast.success("Stock added successfully");
      navigate(`/products/${productId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not add stock");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl">Add Stock</h1>
        <p className="text-sm text-ink-600 dark:text-chalk-200/60">Bring new inventory in against a product, supplier and date.</p>
      </div>

      <Card className="p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Product</label>
            <select
              value={productId}
              onChange={(e) => {
                setProductId(e.target.value);
                setSize("");
                setColor("");
                setLines([]);
              }}
              className={inputCls}
            >
              <option value="">Select product</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Supplier</label>
            <input value={supplier} onChange={(e) => setSupplier(e.target.value)} className={inputCls} placeholder="Supplier name" />
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
        <h2 className="font-display text-lg">Sizes to Add</h2>
        <div className="grid sm:grid-cols-3 gap-3">
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

          <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} className={inputCls} placeholder="Qty" />
        </div>
        <Button variant="secondary" onClick={addLine}>
          <LuPlus size={16} /> Add More
        </Button>

        {lines.length > 0 && (
          <table className="w-full text-sm mt-2">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink-600 dark:text-chalk-200/50 border-b border-chalk-200 dark:border-ink-700">
                <th className="pb-2 font-medium">Size</th>
                <th className="pb-2 font-medium">Colour</th>
                <th className="pb-2 font-medium text-right">Qty</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l, i) => (
                <tr key={i} className="border-b border-chalk-100 dark:border-ink-800 last:border-0">
                  <td className="py-2">{l.size}</td>
                  <td className="py-2">{l.color || "—"}</td>
                  <td className="py-2 text-right font-mono">{l.quantity}</td>
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
          {saving ? "Saving..." : "Save Stock"}
        </Button>
      </div>
    </div>
  );
};

export default AddStock;
