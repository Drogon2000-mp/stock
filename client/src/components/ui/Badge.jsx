const variants = {
  ok: "bg-moss-500/10 text-moss-500 border-moss-500/30",
  low: "bg-brass-500/10 text-brass-600 dark:text-brass-400 border-brass-500/30",
  out: "bg-thread-500/10 text-thread-600 dark:text-thread-500 border-thread-500/30",
  thread: "bg-thread-500/10 text-thread-600 dark:text-thread-500 border-thread-500/30",
  neutral: "bg-chalk-100 dark:bg-ink-800 text-ink-600 dark:text-chalk-200/70 border-chalk-200 dark:border-ink-700",
};

const Badge = ({ children, variant = "neutral" }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${variants[variant]}`}>
    {children}
  </span>
);

export default Badge;
