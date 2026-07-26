const Modal = ({ open, onClose, title, children, footer }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-ink-900 rounded-xl shadow-soft w-full max-w-lg max-h-[85vh] overflow-y-auto border border-chalk-200 dark:border-ink-700">
        <div className="flex items-center justify-between px-5 py-4 border-b border-chalk-200 dark:border-ink-700">
          <h3 className="font-display text-lg">{title}</h3>
          <button onClick={onClose} className="text-ink-600 dark:text-chalk-200/60 hover:text-ink-900 dark:hover:text-chalk-100 focus-ring rounded">
            ✕
          </button>
        </div>
        <div className="p-5">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-chalk-200 dark:border-ink-700 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
