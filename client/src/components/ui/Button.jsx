const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium text-sm px-4 py-2 transition-colors focus-ring disabled:opacity-50 disabled:cursor-not-allowed";

const variants = {
  primary: "bg-ink-900 text-chalk-50 hover:bg-ink-800 dark:bg-brass-500 dark:text-ink-950 dark:hover:bg-brass-400",
  secondary: "bg-chalk-100 text-ink-900 hover:bg-chalk-200 dark:bg-ink-800 dark:text-chalk-100 dark:hover:bg-ink-700",
  danger: "bg-thread-500 text-white hover:bg-thread-600",
  ghost: "bg-transparent text-ink-700 hover:bg-chalk-100 dark:text-chalk-200 dark:hover:bg-ink-800",
};

const Button = ({ children, variant = "primary", className = "", ...props }) => (
  <button className={`${base} ${variants[variant]} ${className}`} {...props}>
    {children}
  </button>
);

export default Button;
