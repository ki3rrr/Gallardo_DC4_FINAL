/** Inline message box. type: error | success | info. */
export default function Alert({ type = 'error', children, onRetry }) {
  if (!children) return null;
  return (
    <div className={`alert alert-${type}`} role="alert">
      <span>{children}</span>
      {onRetry && (
        <button className="link-btn" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
