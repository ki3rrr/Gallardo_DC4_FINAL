import Button from './Button';

/** Prev / Next controls driven by the Laravel paginator `meta` object. */
export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.last_page <= 1) return null;

  return (
    <nav className="pagination" aria-label="Pagination">
      <Button variant="secondary" size="sm" disabled={meta.current_page === 1} onClick={() => onPageChange(meta.current_page - 1)}>
        ← Previous
      </Button>
      <span>
        Page {meta.current_page} of {meta.last_page} <small>({meta.total} records)</small>
      </span>
      <Button
        variant="secondary"
        size="sm"
        disabled={meta.current_page === meta.last_page}
        onClick={() => onPageChange(meta.current_page + 1)}
      >
        Next →
      </Button>
    </nav>
  );
}
