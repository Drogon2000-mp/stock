import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LuBoxes, LuLayers, LuShoppingCart, LuPackagePlus, LuTriangleAlert, LuCircleX } from "react-icons/lu";
import api from "../api/axios";
import StatCard from "../components/ui/StatCard";
import Card from "../components/ui/Card";
import Skeleton from "../components/ui/Skeleton";

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard/summary")
      .then((res) => setSummary(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl">Dashboard</h1>
        <p className="text-sm text-ink-600 dark:text-chalk-200/60">A snapshot of today's inventory activity.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total Products" value={summary.totalProducts} icon={LuLayers} />
        <StatCard label="Total Current Stock" value={summary.totalCurrentStock} icon={LuBoxes} />
        <StatCard label="Sold Today" value={summary.soldToday} tone="thread" icon={LuShoppingCart} />
        <StatCard label="Stock Added Today" value={summary.stockAddedToday} tone="moss" icon={LuPackagePlus} />
        <StatCard label="Low Stock Items" value={summary.lowStockItems} tone="brass" icon={LuTriangleAlert} />
        <StatCard label="Out of Stock Items" value={summary.outOfStockItems} tone="thread" icon={LuCircleX} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h2 className="font-display text-lg mb-3">Recent Sales</h2>
          <div className="space-y-2">
            {summary.recentSales.length === 0 && <p className="text-sm text-ink-600 dark:text-chalk-200/50">No sales recorded yet.</p>}
            {summary.recentSales.map((s) => (
              <div key={s._id} className="flex items-center justify-between text-sm py-2 border-b border-chalk-100 dark:border-ink-800 last:border-0">
                <div>
                  <p className="font-medium">{s.invoiceNumber}</p>
                  <p className="text-xs text-ink-600 dark:text-chalk-200/50">
                    {s.customer || "Walk-in customer"} · {new Date(s.date).toLocaleDateString()}
                  </p>
                </div>
                <span className="font-mono text-sm">{s.totalQuantity} pcs</span>
              </div>
            ))}
          </div>
          <Link to="/sales/history" className="text-xs text-brass-600 dark:text-brass-400 font-medium mt-3 inline-block">
            View all sales →
          </Link>
        </Card>

        <Card className="p-5">
          <h2 className="font-display text-lg mb-3">Recent Stock Updates</h2>
          <div className="space-y-2">
            {summary.recentHistory.length === 0 && <p className="text-sm text-ink-600 dark:text-chalk-200/50">No stock movements yet.</p>}
            {summary.recentHistory.map((h) => (
              <div key={h._id} className="flex items-center justify-between text-sm py-2 border-b border-chalk-100 dark:border-ink-800 last:border-0">
                <div>
                  <p className="font-medium">
                    {h.productName} {h.size}
                    {h.color ? ` · ${h.color}` : ""}
                  </p>
                  <p className="text-xs text-ink-600 dark:text-chalk-200/50">
                    {h.type.replace("_", " ")} · {new Date(h.date).toLocaleDateString()}
                  </p>
                </div>
                <span className={`font-mono text-sm ${h.changedQuantity < 0 ? "text-thread-500" : "text-moss-500"}`}>
                  {h.changedQuantity > 0 ? "+" : ""}
                  {h.changedQuantity}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
