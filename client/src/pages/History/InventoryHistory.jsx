import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Skeleton from "../../components/ui/Skeleton";

const TYPES = ["", "SALE", "ADD_STOCK", "RETURN", "ADJUSTMENT"];
const typeVariant = { SALE: "thread", ADD_STOCK: "ok", RETURN: "low", ADJUSTMENT: "neutral" };

const inputCls =
  "rounded-lg border border-chalk-200 dark:border-ink-700 bg-white dark:bg-ink-900 px-3 py-2 text-sm focus-ring";

const InventoryHistory = () => {
  const [params] = useSearchParams();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("");

  useEffect(() => {
    setLoading(true);
    const query = { type: type || undefined };
    if (params.get("product")) query.product = params.get("product");
    api
      .get("/history", { params: query })
      .then((res) => setRecords(res.data.records))
      .finally(() => setLoading(false));
  }, [type, params]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl">Inventory History</h1>
        <p className="text-sm text-ink-600 dark:text-chalk-200/60">
          A permanent, unmodifiable ledger of every stock movement — nothing is ever deleted.
        </p>
      </div>

      <select value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
        {TYPES.map((t) => (
          <option key={t} value={t}>
            {t ? t.replace("_", " ") : "All movement types"}
          </option>
        ))}
      </select>

      {loading ? (
        <Skeleton className="h-96" />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink-600 dark:text-chalk-200/50 border-b border-chalk-200 dark:border-ink-700">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Product</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium text-right">Before</th>
                <th className="p-4 font-medium text-right">Change</th>
                <th className="p-4 font-medium text-right">After</th>
                <th className="p-4 font-medium">Ref / By</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r._id} className="border-b border-chalk-100 dark:border-ink-800 last:border-0">
                  <td className="p-4">{new Date(r.date).toLocaleString()}</td>
                  <td className="p-4">
                    {r.productName} {r.size}
                    {r.color ? ` · ${r.color}` : ""}
                  </td>
                  <td className="p-4">
                    <Badge variant={typeVariant[r.type]}>{r.type.replace("_", " ")}</Badge>
                  </td>
                  <td className="p-4 text-right font-mono">{r.beforeQuantity}</td>
                  <td className={`p-4 text-right font-mono ${r.changedQuantity < 0 ? "text-thread-500" : "text-moss-500"}`}>
                    {r.changedQuantity > 0 ? "+" : ""}
                    {r.changedQuantity}
                  </td>
                  <td className="p-4 text-right font-mono">{r.afterQuantity}</td>
                  <td className="p-4 text-xs text-ink-600 dark:text-chalk-200/50">
                    {r.invoiceNumber || r.supplier?.name || "—"} · {r.updatedBy?.name}
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-sm text-ink-600 dark:text-chalk-200/50">
                    No movements match this filter.
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

export default InventoryHistory;
