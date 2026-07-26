import { useEffect, useState } from "react";
import api from "../../api/axios";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Skeleton from "../../components/ui/Skeleton";

const PERIODS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "custom", label: "Custom Date" },
];

const inputCls =
  "rounded-lg border border-chalk-200 dark:border-ink-700 bg-white dark:bg-ink-900 px-3 py-2 text-sm focus-ring";

const Reports = () => {
  const [period, setPeriod] = useState("daily");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = { period };
    if (period === "custom") {
      params.from = from;
      params.to = to;
    }
    api
      .get("/reports", { params })
      .then((res) => setReport(res.data))
      .finally(() => setLoading(false));
  }, [period, from, to]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl">Reports</h1>
        <p className="text-sm text-ink-600 dark:text-chalk-200/60">Opening/closing stock and movement summaries for any period.</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <select value={period} onChange={(e) => setPeriod(e.target.value)} className={inputCls}>
          {PERIODS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        {period === "custom" && (
          <>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputCls} />
            <span className="text-sm text-ink-600 dark:text-chalk-200/50">to</span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputCls} />
          </>
        )}
      </div>

      {loading || !report ? (
        <Skeleton className="h-72" />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              ["Opening Stock", report.openingStock],
              ["Stock Added", report.stockAdded],
              ["Items Sold", report.itemsSold],
              ["Closing Stock", report.closingStock],
            ].map(([label, value]) => (
              <Card key={label} className="p-4">
                <p className="text-xs uppercase tracking-wide text-ink-600 dark:text-chalk-200/50">{label}</p>
                <p className="font-mono text-2xl mt-1">{value}</p>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="font-display text-lg">Low Stock</h2>
                <Badge variant="low">{report.lowStock.length}</Badge>
              </div>
              <div className="space-y-1.5 max-h-72 overflow-y-auto">
                {report.lowStock.length === 0 && <p className="text-sm text-ink-600 dark:text-chalk-200/50">Nothing running low.</p>}
                {report.lowStock.map((i, idx) => (
                  <div key={idx} className="flex justify-between text-sm py-1.5 border-b border-chalk-100 dark:border-ink-800 last:border-0">
                    <span>
                      {i.product} {i.size}
                      {i.color ? ` · ${i.color}` : ""}
                    </span>
                    <span className="font-mono text-brass-600 dark:text-brass-400">{i.currentStock}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="font-display text-lg">Out of Stock</h2>
                <Badge variant="out">{report.outOfStock.length}</Badge>
              </div>
              <div className="space-y-1.5 max-h-72 overflow-y-auto">
                {report.outOfStock.length === 0 && <p className="text-sm text-ink-600 dark:text-chalk-200/50">Nothing out of stock.</p>}
                {report.outOfStock.map((i, idx) => (
                  <div key={idx} className="text-sm py-1.5 border-b border-chalk-100 dark:border-ink-800 last:border-0">
                    {i.product} {i.size}
                    {i.color ? ` · ${i.color}` : ""}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
