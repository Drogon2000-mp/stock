import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import StockBar from "../../components/ui/StockBar";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";
import { useAuth } from "../../context/AuthContext";

const ProductDetail = () => {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const [product, setProduct] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([api.get(`/products/${id}`), api.get(`/history/product/${id}`)])
      .then(([p, h]) => {
        setProduct(p.data);
        setHistory(h.data.slice(0, 8));
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  if (loading) return <Skeleton className="h-96" />;
  if (!product) return <p>Product not found.</p>;

  const maxStock = Math.max(...product.variants.map((v) => Math.max(v.openingStock, v.currentStock)), 1);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl">{product.name}</h1>
          <p className="text-sm text-ink-600 dark:text-chalk-200/60">
            {product.category} {product.gender !== "Unisex" ? `· ${product.gender}` : ""}
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Link to={`/stock/add?product=${product._id}`}>
              <Button variant="secondary">Add Stock</Button>
            </Link>
            <Link to={`/sales/new?product=${product._id}`}>
              <Button>Sell Stock</Button>
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          ["Opening Stock", product.openingStockTotal],
          ["Current Stock", product.currentStockTotal],
          ["Total Sold", product.totalSold],
          ["Stock Added", product.totalAdded],
        ].map(([label, value]) => (
          <Card key={label} className="p-4">
            <p className="text-xs uppercase tracking-wide text-ink-600 dark:text-chalk-200/50">{label}</p>
            <p className="font-mono text-2xl mt-1">{value}</p>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="p-5 pb-0 flex items-center justify-between">
          <h2 className="font-display text-lg">Size{product.hasColors ? " / Colour" : ""} Breakdown</h2>
          <Link to={`/history?product=${product._id}`} className="text-xs text-brass-600 dark:text-brass-400 font-medium">
            View full history →
          </Link>
        </div>
        <div className="overflow-x-auto p-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink-600 dark:text-chalk-200/50 border-b border-chalk-200 dark:border-ink-700">
                <th className="pb-2 font-medium">Size</th>
                {product.hasColors && <th className="pb-2 font-medium">Colour</th>}
                <th className="pb-2 font-medium">Stock Level</th>
                <th className="pb-2 font-medium text-right">Current Stock</th>
                <th className="pb-2 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {product.variants.map((v) => (
                <tr key={v._id} className="border-b border-chalk-100 dark:border-ink-800 last:border-0">
                  <td className="py-3 font-medium font-mono">{v.size}</td>
                  {product.hasColors && <td className="py-3">{v.color}</td>}
                  <td className="py-3 w-40">
                    <StockBar current={v.currentStock} max={maxStock} threshold={product.lowStockThreshold} />
                  </td>
                  <td className="py-3 text-right font-mono">{v.currentStock}</td>
                  <td className="py-3 text-right">
                    {v.currentStock === 0 ? (
                      <Badge variant="out">Out of stock</Badge>
                    ) : v.currentStock < (product.lowStockThreshold || 5) ? (
                      <Badge variant="low">Low</Badge>
                    ) : (
                      <Badge variant="ok">Healthy</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="font-display text-lg mb-3">Recent Movements</h2>
        <div className="space-y-2">
          {history.length === 0 && <p className="text-sm text-ink-600 dark:text-chalk-200/50">No movements recorded yet.</p>}
          {history.map((h) => (
            <div key={h._id} className="flex items-center justify-between text-sm py-2 border-b border-chalk-100 dark:border-ink-800 last:border-0">
              <div>
                <p className="font-medium">
                  {h.size}
                  {h.color ? ` · ${h.color}` : ""} — {h.type.replace("_", " ")}
                </p>
                <p className="text-xs text-ink-600 dark:text-chalk-200/50">
                  {new Date(h.date).toLocaleString()} {h.updatedBy?.name ? `· ${h.updatedBy.name}` : ""}
                </p>
              </div>
              <span className={`font-mono ${h.changedQuantity < 0 ? "text-thread-500" : "text-moss-500"}`}>
                {h.changedQuantity > 0 ? "+" : ""}
                {h.changedQuantity}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ProductDetail;
