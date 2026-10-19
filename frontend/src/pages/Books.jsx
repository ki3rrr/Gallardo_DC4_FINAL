import { useEffect, useState } from 'react';
import useFetch from '../hooks/useFetch';
import useDebounce from '../hooks/useDebounce';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { booksApi, borrowingsApi, categoriesApi } from '../services/library';
import { parseError } from '../services/api';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';
import BookFormModal from '../components/BookFormModal';
import Icon from '../components/Icon';

function BookCard({ book, isAdmin, requesting, onRequest, onEdit, onDelete }) {
  const [coverFailed, setCoverFailed] = useState(false);

  return (
    <article className="book-card">
      <div className="book-cover">
        {book.cover_url && !coverFailed ? (
          <img
            src={book.cover_url}
            alt={`Cover of ${book.title}`}
            loading="lazy"
            onError={() => setCoverFailed(true)}
          />
        ) : (
          <Icon name="book" size={54} />
        )}
      </div>
      <div className="book-info">
        <h3 title={book.title}>{book.title}</h3>
        <p className="muted">{book.author?.name}</p>
        <p><span className="chip">{book.category?.name}</span></p>
        <p className={book.is_available ? 'avail ok' : 'avail none'}>
          {book.is_available ? `${book.copies_available} of ${book.copies_total} available` : 'All copies on loan'}
        </p>
        {book.description && <p className="desc">{book.description}</p>}
      </div>
      <div className="book-actions">
        {isAdmin ? (
          <>
            <Button size="sm" variant="secondary" iconOnly aria-label={`Edit ${book.title}`} title={`Edit ${book.title}`} onClick={() => onEdit(book)}><Icon name="edit" /></Button>
            <Button size="sm" variant="danger" iconOnly aria-label={`Delete ${book.title}`} title={`Delete ${book.title}`} onClick={() => onDelete(book)}><Icon name="trash" /></Button>
          </>
        ) : (
          <Button size="sm" disabled={!book.is_available} loading={requesting} onClick={() => onRequest(book)}>
            {book.is_available ? 'Request to borrow' : 'Unavailable'}
          </Button>
        )}
      </div>
    </article>
  );
}

export default function Books() {
  const { isAdmin } = useAuth();
  const notify = useToast();

  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);

  const [categories, setCategories] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [toRequest, setToRequest] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    categoriesApi.list({ all: 1 }).then((res) => setCategories(res.data.data)).catch(() => {});
  }, []);

  const { data: books, meta, loading, error, reload } = useFetch(
    () =>
      booksApi.list({
        search: debouncedSearch || undefined,
        category_id: categoryId || undefined,
        available: availableOnly ? 1 : undefined,
        page,
      }),
    [debouncedSearch, categoryId, availableOnly, page]
  );

  const resetPage = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const confirmRequest = async () => {
    setBusy(true);
    try {
      await borrowingsApi.request(toRequest.id);
      notify.success(`Request sent for "${toRequest.title}". A librarian will review it.`);
      setToRequest(null);
      reload();
    } catch (err) {
      const parsed = parseError(err);
      notify.error(parsed.errors.book_id?.[0] || parsed.message);
      setToRequest(null);
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await booksApi.remove(toDelete.id);
      notify.success('Book deleted.');
      setToDelete(null);
      if (books.length === 1 && page > 1) setPage(page - 1);
      else reload();
    } catch (err) {
      notify.error(parseError(err).message);
      setToDelete(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">THE COLLECTION</p>
          <h1>Books</h1>
          <p className="page-subtitle">Find a title, check availability, and keep your reading moving.</p>
        </div>
        {isAdmin && (
          <Button onClick={() => { setEditingBook(null); setFormOpen(true); }}><Icon name="plus" /> Add book</Button>
        )}
      </div>

      <div className="toolbar">
        <input type="search" placeholder="Search title, author or ISBN…" value={search} onChange={(e) => resetPage(setSearch)(e.target.value)} />
        <select value={categoryId} onChange={(e) => resetPage(setCategoryId)(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <label className="check">
          <input type="checkbox" checked={availableOnly} onChange={(e) => resetPage(setAvailableOnly)(e.target.checked)} />
          Available only
        </label>
      </div>

      {loading && <Spinner label="Loading books…" />}
      {error && <Alert onRetry={reload}>{error}</Alert>}
      {!loading && !error && books.length === 0 && <div className="empty-state">No books match your search.</div>}

      {!loading && !error && books.length > 0 && (
        <div className="book-grid">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              isAdmin={isAdmin}
              requesting={busy && toRequest?.id === book.id}
              onRequest={setToRequest}
              onEdit={(b) => { setEditingBook(b); setFormOpen(true); }}
              onDelete={setToDelete}
            />
          ))}
        </div>
      )}

      <Pagination meta={meta} onPageChange={setPage} />

      {isAdmin && (
        <BookFormModal
          open={formOpen}
          book={editingBook}
          onClose={() => setFormOpen(false)}
          onSaved={() => { setFormOpen(false); reload(); }}
        />
      )}

      <ConfirmDialog
        open={Boolean(toRequest)}
        title="Request this book?"
        message={`Send a borrowing request for "${toRequest?.title}"? A librarian must approve it before you can pick it up.`}
        confirmLabel="Send request"
        loading={busy}
        onConfirm={confirmRequest}
        onCancel={() => setToRequest(null)}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete book"
        message={`Delete "${toDelete?.title}"? This also removes its borrowing history and cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={busy}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </section>
  );
}
