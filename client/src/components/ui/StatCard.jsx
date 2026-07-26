const tones = {
  neutral: "text-ink-900 dark:text-chalk-100",
  brass: "text-brass-600 dark:text-brass-400",
  thread: "text-thread-600 dark:text-thread-500",
  moss: "text-moss-500",
};

const StatCard = ({ label, value, tone = "neutral", icon: Icon, hint }) => (
  <div className="bg-white dark:bg-ink-900 rounded-xl shadow-card border border-chalk-200 dark:border-ink-700 p-5 flex items-start justify-between">
    <div>
      <p className="text-xs uppercase tracking-wide text-ink-600 dark:text-chalk-200/60 font-medium">{label}</p>
      <p className={`font-display text-3xl mt-2 ${tones[tone]}`}>{value}</p>
      {hint && <p className="text-xs text-ink-600 dark:text-chalk-200/50 mt-1">{hint}</p>}
    </div>
    {Icon && (
      <div className={`p-2.5 rounded-lg bg-chalk-100 dark:bg-ink-800 ${tones[tone]}`}>
        <Icon size={20} />
      </div>
    )}
  </div>
);

export default StatCard;
