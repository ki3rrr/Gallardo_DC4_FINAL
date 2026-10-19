import Spinner from './Spinner';
import Alert from './Alert';

/**
 * Reusable table with loading, error and empty states.
 * columns: [{ key, header, render?(row) }]
 */
export default function DataTable({ columns, rows, loading, error, onRetry, emptyMessage = 'No records found.' }) {
  if (loading) return <Spinner />;
  if (error) return <Alert onRetry={onRetry}>{error}</Alert>;
  if (!rows || rows.length === 0) return <div className="empty-state">{emptyMessage}</div>;

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((c) => (
                <td key={c.key} data-label={c.header}>
                  {c.render ? c.render(row) : row[c.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
