import { useState } from 'react';
import useFetch from '../hooks/useFetch';
import useDebounce from '../hooks/useDebounce';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { borrowingsApi } from '../services/library';
import { parseError } from '../services/api';
import Button from '../components/Button';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import Icon from '../components/Icon';

const STATUSES = ['pending', 'approved', 'returned', 'rejected'];

/** What each confirm action does and says. */
const ACTIONS = {
  approve: { title: 'Approve request', confirm: 'Approve', note: false, danger: false, text: (r) => `Approve "${r.book.title}" for ${r.user.name}? The loan is due in 14 days.` },
  reject: { title: 'Reject request', confirm: 'Reject', note: true, danger: true, text: (r) => `Reject the request of ${r.user.name} for "${r.book.title}"?` },
  return: { title: 'Mark as returned', confirm: 'Mark returned', note: false, danger: false, text: (r) => `Confirm that ${r.user.name} returned "${r.book.title}"?` },
  cancel: { title: 'Cancel request', confirm: 'Cancel request', note: false, danger: true, text: (r) => `Cancel your request for "${r.book.title}"?` },
  delete: { title: 'Delete record', confirm: 'Delete', note: false, danger: true, text: (r) => `Delete this borrowing record for "${r.book.title}"? This cannot be undone.` },
};

export default function Borrowings() {
  const { isAdmin } = useAuth();
  const notify = useToast();

  const [status, setStatus] = useState('');
  const [overdue, setOverdue] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search);

  const [pending, setPending] = useState(null); // { type, row }
  const [busy, setBusy] = useState(false);

  const { data, meta, loading, error, reload } = useFetch(
    () =>
      borrowingsApi.list({
        status: status || undefined,
        overdue: overdue ? 1 : undefined,
        search: debounced || undefined,
        page,
      }),
    [status, overdue, debounced, page]
  );

  const runAction = async (note) => {
    const { type, row } = pending;
    setBusy(true);
    try {
      if (type === 'approve') await borrowingsApi.setStatus(row.id, { status: 'approved' });
      if (type === 'reject') await borrowingsApi.setStatus(row.id, { status: 'rejected', admin_note: note || undefined });
      if (type === 'return') await borrowingsApi.setStatus(row.id, { status: 'returned' });
      if (type === 'cancel' || type === 'delete') await borrowingsApi.remove(row.id);

      notify.success(
        { approve: 'Request approved.', reject: 'Request rejected.', return: 'Book marked as returned.', cancel: 'Request cancelled.', delete: 'Record deleted.' }[type]
      );
      setPending(null);
      reload();
    } catch (err) {
      const parsed = parseError(err);
      notify.error(parsed.errors.status?.[0] || parsed.message);
      setPending(null);
    } finally {
      setBusy(false);
    }
  };

  const actionButtons = (row) => {
    const btn = (type, label, variant, icon) => (
      <Button key={type} size="sm" variant={variant} iconOnly aria-label={`${label} ${row.book.title}`} title={label} onClick={() => setPending({ type, row })}>
        <Icon name={icon} size={17} />
      </Button>
    );

    if (isAdmin) {
      if (row.status === 'pending') {
        return [
          btn('approve', 'Approve', 'primary', 'checkCircle'),
          btn('reject', 'Reject', 'danger', 'xCircle'),
        ];
      }
      if (row.status === 'approved') return [btn('return', 'Mark returned', 'primary', 'checkCircle')];
      return [btn('delete', 'Delete', 'ghost', 'trash')];
    }
    return row.status === 'pending' ? [btn('cancel', 'Cancel', 'danger', 'close')] : null;
  };

  const columns = [
    {
      key: 'book',
      header: 'Book',
      render: (r) => (
        <>
          <strong>{r.book.title}</strong>
          <br />
          <small className="muted">{r.book.author?.name}</small>
        </>
      ),
    },
    ...(isAdmin ? [{ key: 'user', header: 'Member', render: (r) => r.user.name }] : []),
    { key: 'requested_at', header: 'Requested' },
    { key: 'due_date', header: 'Due date' },
    { key: 'returned_at', header: 'Returned' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} overdue={r.is_overdue} /> },
    { key: 'admin_note', header: 'Note' },
    { key: 'actions', header: 'Actions', render: (r) => <div className="row-actions">{actionButtons(r)}</div> },
  ];

  const reset = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const action = pending ? ACTIONS[pending.type] : null;

  return (
    <section>
      <div className="page-header">
        <h1>{isAdmin ? 'Borrowings' : 'My Borrowings'}</h1>
      </div>

      <div className="toolbar">
        <input type="search" placeholder={isAdmin ? 'Search book or member…' : 'Search book…'} value={search} onChange={(e) => reset(setSearch)(e.target.value)} />
        <select value={status} onChange={(e) => reset(setStatus)(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <label className="check">
          <input type="checkbox" checked={overdue} onChange={(e) => reset(setOverdue)(e.target.checked)} />
          Overdue only
        </label>
      </div>

      <DataTable columns={columns} rows={data} loading={loading} error={error} onRetry={reload} emptyMessage="No borrowing records found." />
      <Pagination meta={meta} onPageChange={setPage} />

      <ConfirmDialog
        open={Boolean(pending)}
        title={action?.title}
        message={pending ? action.text(pending.row) : ''}
        confirmLabel={action?.confirm}
        danger={action?.danger}
        withNote={action?.note}
        noteLabel="Reason for the member (optional)"
        loading={busy}
        onConfirm={runAction}
        onCancel={() => setPending(null)}
      />
    </section>
  );
}
