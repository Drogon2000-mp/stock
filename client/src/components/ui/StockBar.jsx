// Signature UI element: a stock level rendered like a tailor's tape measure.
const StockBar = ({ current, max, threshold = 5 }) => {
  const pct = max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0;
  const color = current === 0 ? "bg-thread-500" : current < threshold ? "bg-brass-500" : "bg-moss-500";

  return (
    <div className="tape-bar w-full">
      <span className={color} style={{ width: `${pct}%` }} />
    </div>
  );
};

export default StockBar;
