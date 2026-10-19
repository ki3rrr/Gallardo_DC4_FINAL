/** Reusable button. variant: primary | secondary | danger | ghost. */
export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  iconOnly = false,
  className = '',
  children,
  ...props
}) {
  return (
    <button
      className={`btn btn-${variant} btn-${size}${iconOnly ? ' btn-icon-only' : ''}${className ? ` ${className}` : ''}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Please wait…' : children}
    </button>
  );
}
