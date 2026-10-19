import { useEffect, useState } from 'react';
import Modal from './Modal';
import FormInput from './FormInput';
import Button from './Button';
import Alert from './Alert';
import { authorsApi, booksApi, categoriesApi } from '../services/library';
import { parseError } from '../services/api';
import { useToast } from '../context/ToastContext';

const EMPTY = {
  title: '', isbn: '', author_id: '', category_id: '', publisher: '',
  published_year: '', description: '', copies_total: 1,
};

/** Create / edit a book (multipart form with optional cover image). */
export default function BookFormModal({ open, book, onClose, onSaved }) {
  const notify = useToast();
  const isEdit = Boolean(book);

  const [form, setForm] = useState(EMPTY);
  const [cover, setCover] = useState(null);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);

  // Load dropdown options once the modal opens
  useEffect(() => {
    if (!open) return;
    Promise.all([authorsApi.list({ all: 1 }), categoriesApi.list({ all: 1 })])
      .then(([a, c]) => {
        setAuthors(a.data.data);
        setCategories(c.data.data);
      })
      .catch((err) => setFormError(parseError(err).message));
  }, [open]);

  // Fill the form when editing, reset when adding
  useEffect(() => {
    if (!open) return;
    setErrors({});
    setFormError('');
    setCover(null);
    setForm(
      book
        ? {
            title: book.title ?? '', isbn: book.isbn ?? '',
            author_id: book.author_id ?? '', category_id: book.category_id ?? '',
            publisher: book.publisher ?? '', published_year: book.published_year ?? '',
            description: book.description ?? '', copies_total: book.copies_total ?? 1,
          }
        : EMPTY
    );
  }, [open, book]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required.';
    if (!form.isbn.trim()) e.isbn = 'ISBN is required.';
    if (!form.author_id) e.author_id = 'Please choose an author.';
    if (!form.category_id) e.category_id = 'Please choose a category.';
    const copies = Number(form.copies_total);
    if (!Number.isInteger(copies) || copies < 1) e.copies_total = 'Copies must be a whole number of at least 1.';
    if (form.published_year !== '' && (Number(form.published_year) < 1000 || Number(form.published_year) > new Date().getFullYear() + 1))
      e.published_year = 'Enter a valid year.';
    if (cover) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(cover.type)) e.cover = 'Cover must be a JPG, PNG or WEBP image.';
      else if (cover.size > 2 * 1024 * 1024) e.cover = 'Cover must not be larger than 2 MB.';
    }
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const clientErrors = validate();
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) return;

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== '' && v !== null) fd.append(k, v);
    });
    if (cover) fd.append('cover', cover);

    setSaving(true);
    setFormError('');
    try {
      if (isEdit) await booksApi.update(book.id, fd);
      else await booksApi.create(fd);
      notify.success(`Book ${isEdit ? 'updated' : 'added'} successfully.`);
      onSaved();
    } catch (err) {
      const parsed = parseError(err);
      setErrors(Object.fromEntries(Object.entries(parsed.errors).map(([k, v]) => [k, v[0]])));
      setFormError(parsed.status === 422 ? '' : parsed.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} title={isEdit ? 'Edit book' : 'Add book'} onClose={onClose} wide>
      <form onSubmit={handleSubmit} noValidate>
        <Alert>{formError}</Alert>
        <div className="form-grid">
          <FormInput label="Title *" name="title" value={form.title} error={errors.title} onChange={set('title')} />
          <FormInput label="ISBN *" name="isbn" value={form.isbn} error={errors.isbn} onChange={set('isbn')} />
          <FormInput as="select" label="Author *" name="author_id" value={form.author_id} error={errors.author_id} onChange={set('author_id')}>
            <option value="">Select author…</option>
            {authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </FormInput>
          <FormInput as="select" label="Category *" name="category_id" value={form.category_id} error={errors.category_id} onChange={set('category_id')}>
            <option value="">Select category…</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </FormInput>
          <FormInput label="Publisher" name="publisher" value={form.publisher} error={errors.publisher} onChange={set('publisher')} />
          <FormInput label="Year published" name="published_year" type="number" value={form.published_year} error={errors.published_year} onChange={set('published_year')} />
          <FormInput label="Total copies *" name="copies_total" type="number" min="1" value={form.copies_total} error={errors.copies_total} onChange={set('copies_total')} />
          <FormInput label="Cover image (JPG/PNG/WEBP, max 2 MB)" name="cover" type="file" accept="image/*" error={errors.cover}
            onChange={(e) => setCover(e.target.files[0] ?? null)} />
        </div>
        <FormInput as="textarea" rows={3} label="Description" name="description" value={form.description} error={errors.description} onChange={set('description')} />
        <div className="modal-actions">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>{isEdit ? 'Save changes' : 'Add book'}</Button>
        </div>
      </form>
    </Modal>
  );
}
