import { NavLink } from "react-router-dom";
import {
  LuLayoutDashboard,
  LuShirt,
  LuShoppingCart,
  LuPackagePlus,
  LuHistory,
  LuChartBar,
  LuReceipt,
  LuRefreshCw,
} from "react-icons/lu";
import { useAuth } from "../../context/AuthContext";

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? "bg-ink-900 text-chalk-50 dark:bg-brass-500 dark:text-ink-950"
      : "text-ink-700 dark:text-chalk-200/80 hover:bg-chalk-100 dark:hover:bg-ink-800"
  }`;

const Sidebar = ({ onNavigate }) => {
  const { isAdmin } = useAuth();

  return (
    <nav className="flex flex-col gap-1 p-4">
      <div className="px-2 pb-4 mb-2 border-b border-chalk-200 dark:border-ink-700">
        <p className="font-display text-xl tracking-tight">Time Tailor</p>
        <p className="text-xs text-ink-600 dark:text-chalk-200/50">Inventory & Sales</p>
      </div>

      <NavLink to="/" end className={linkClass} onClick={onNavigate}>
        <LuLayoutDashboard size={18} /> Dashboard
      </NavLink>
      <NavLink to="/products" className={linkClass} onClick={onNavigate}>
        <LuShirt size={18} /> Products
      </NavLink>
      <NavLink to="/sales/history" className={linkClass} onClick={onNavigate}>
        <LuReceipt size={18} /> Sales History
      </NavLink>
      <NavLink to="/exchange" className={linkClass} onClick={onNavigate}>
        <LuRefreshCw size={18} /> Exchange
      </NavLink>

      {isAdmin && (
        <>
          <div className="mt-3 mb-1 px-2 text-xs uppercase tracking-wide text-ink-600 dark:text-chalk-200/40">Admin</div>
          <NavLink to="/sales/new" className={linkClass} onClick={onNavigate}>
            <LuShoppingCart size={18} /> Sell Stock
          </NavLink>
          <NavLink to="/stock/add" className={linkClass} onClick={onNavigate}>
            <LuPackagePlus size={18} /> Add Stock
          </NavLink>
          <NavLink to="/history" className={linkClass} onClick={onNavigate}>
            <LuHistory size={18} /> Inventory History
          </NavLink>
          <NavLink to="/reports" className={linkClass} onClick={onNavigate}>
            <LuChartBar size={18} /> Reports
          </NavLink>
        </>
      )}
    </nav>
  );
};

export default Sidebar;
