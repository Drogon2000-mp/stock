import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LuSearch, LuPlus } from "react-icons/lu";
import api from "../../api/axios";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Skeleton from "../../components/ui/Skeleton";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";

const CATEGORIES = ["All", "Half Pant", "Jacket", "Sweater", "House Dress", "Track Suit", "Shoes", "Other"];

const stockStatus = (product) => {
  const total = product.variants.reduce((s, v) => s + v.currentStock, 0);
  const anyOut = product.variants.some((v) => v.currentStock === 0);
  const anyLow = product.variants.some((v) => v.currentStock > 0 && v.currentStock < (product.lowStockThreshold || 5));
  return { total, anyOut, anyLow };
};

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const { isAdmin } = useAuth();

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (category !== "All") params.category = category;
    api
      .get("/products", { params })
      .then((res) => setProducts(res.data))
      .finally(() => setLoading(false));
  }, [search, category]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl">Products</h1>
          <p className="text-sm text-ink-600 dark:text-chalk-200/60">Browse every product and its size/colour stock.</p>
        </div>
        {isAdmin && (
          <Link to="/stock/add">
            <Button>
              <LuPlus size={16} /> Add Stock
            </Button>
          </Link>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-600 dark:text-chalk-200/40" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-chalk-200 dark:border-ink-700 bg-white dark:bg-ink-900 text-sm focus-ring"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-chalk-200 dark:border-ink-700 bg-white dark:bg-ink-900 text-sm px-3 py-2 focus-ring"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => {
            const { total, anyOut, anyLow } = stockStatus(p);
            return (
              <Link key={p._id} to={`/products/${p._id}`}>
                <Card className="p-5 h-full hover:shadow-soft transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-display text-lg">{p.name}</p>
                      <p className="text-xs text-ink-600 dark:text-chalk-200/50">
                        {p.category} · {p.variants.length} variant{p.variants.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    {anyOut ? (
                      <Badge variant="out">Out of stock</Badge>
                    ) : anyLow ? (
                      <Badge variant="low">Low stock</Badge>
                    ) : (
                      <Badge variant="ok">In stock</Badge>
                    )}
                  </div>
                  <p className="font-mono text-2xl mt-3">{total}</p>
                  <p className="text-xs text-ink-600 dark:text-chalk-200/50">Total Stock</p>
                </Card>
              </Link>
            );
          })}
          {products.length === 0 && (
            <p className="text-sm text-ink-600 dark:text-chalk-200/50 col-span-full text-center py-10">No products found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductList;
