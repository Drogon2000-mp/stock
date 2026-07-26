import { LuMenu, LuMoon, LuSun, LuLogOut } from "react-icons/lu";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();

  return (
    <header className="h-16 border-b border-chalk-200 dark:border-ink-700 bg-white/80 dark:bg-ink-900/80 backdrop-blur sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6">
      <button className="lg:hidden p-2 -ml-2 focus-ring rounded" onClick={onMenuClick} aria-label="Open menu">
        <LuMenu size={20} />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        <button onClick={toggle} className="p-2 rounded-lg hover:bg-chalk-100 dark:hover:bg-ink-800 focus-ring" aria-label="Toggle theme">
          {dark ? <LuSun size={18} /> : <LuMoon size={18} />}
        </button>
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium leading-tight">{user?.name}</p>
          <p className="text-xs text-ink-600 dark:text-chalk-200/50 leading-tight capitalize">{user?.role}</p>
        </div>
        <button onClick={logout} className="p-2 rounded-lg hover:bg-chalk-100 dark:hover:bg-ink-800 focus-ring" aria-label="Log out">
          <LuLogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
