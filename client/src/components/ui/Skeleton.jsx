const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-chalk-200 dark:bg-ink-700 rounded ${className}`} />
);

export default Skeleton;
