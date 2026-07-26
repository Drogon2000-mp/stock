import { useEffect, useState } from "react";
import api from "../../api/axios";
import Card from "../../components/ui/Card";
import Skeleton from "../../components/ui/Skeleton";

const RANGES = [
  { value: "", label: "All time" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
];

const inputCls =
  "rounded-lg border border-chalk-200 dark:border-ink-700 bg-white dark:bg-ink-900 px-3 py-2 text-sm focus-ring";

const SalesHistory = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [customer, setCustomer] = useState("");
  const [product, setProduct] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (range) params.range = range;
    if (invoiceNumber) params.invoiceNumber = invoiceNumber;
    if (customer) params.customer = customer;
    if (product) params.product = product;

    const delay = setTimeout(() => {
      api
        .get("/sales", { params })
        .then((res) => setSales(res.data.sales))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(delay);
  }, [range, invoiceNumber, customer, product]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl">Sales History</h1>
        <p className="text-sm text-ink-600 dark:text-chalk-200/60">Every sale, searchable and filterable.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select value={range} onChange={(e) => setRange(e.target.value)} className={inputCls}>
          {RANGES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        <input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="Invoice #" className={inputCls} />
        <input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Customer" className={inputCls} />
        <input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Product" className={inputCls} />
      </div>

      {loading ? (
        <Skeleton className="h-96" />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink-600 dark:text-chalk-200/50 border-b border-chalk-200 dark:border-ink-700">
                <th className="p-4 font-medium">Invoice</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Items</th>
                <th className="p-4 font-medium text-right">Total Qty</th>
                <th className="p-4 font-medium">By</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s._id} className="border-b border-chalk-100 dark:border-ink-800 last:border-0 align-top">
                  <td className="p-4 font-medium">{s.invoiceNumber}</td>
                  <td className="p-4">{new Date(s.date).toLocaleDateString()}</td>
                  <td className="p-4">{s.customer || "Walk-in"}</td>
                  <td className="p-4">
                    {s.items.map((i, idx) => (
                      <div key={idx} className="text-xs text-ink-600 dark:text-chalk-200/60">
                        {i.productName} {i.size}
                        {i.color ? ` (${i.color})` : ""} × {i.quantity}
                      </div>
                    ))}
                  </td>
                  <td className="p-4 text-right font-mono">{s.totalQuantity}</td>
                  <td className="p-4 text-xs text-ink-600 dark:text-chalk-200/50">{s.createdBy?.name}</td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-ink-600 dark:text-chalk-200/50">
                    No sales match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

export default SalesHistory;
