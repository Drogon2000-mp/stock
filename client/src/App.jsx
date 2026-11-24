import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import DashboardLayout from "./components/Layout/DashboardLayout.jsx";

import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProductList from "./pages/Products/ProductList.jsx";
import ProductDetail from "./pages/Products/ProductDetail.jsx";
import SellStock from "./pages/Sales/SellStock.jsx";
import SalesHistory from "./pages/Sales/SalesHistory.jsx";
import AddStock from "./pages/Stock/AddStock.jsx";
import InventoryHistory from "./pages/History/InventoryHistory.jsx";
import Reports from "./pages/Reports/Reports.jsx";
import Exchange from "./pages/Exchange/Exchange.jsx";
import NotFound from "./pages/NotFound.jsx";

function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/sales/history" element={<SalesHistory />} />
            <Route path="/exchange" element={<Exchange />} />

            <Route element={<ProtectedRoute adminOnly />}>
              <Route path="/sales/new" element={<SellStock />} />
              <Route path="/stock/add" element={<AddStock />} />
              <Route path="/history" element={<InventoryHistory />} />
              <Route path="/reports" element={<Reports />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
