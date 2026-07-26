const Card = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-ink-900 rounded-xl shadow-card border border-chalk-200 dark:border-ink-700 ${className}`}>
    {children}
  </div>
);

export default Card;
