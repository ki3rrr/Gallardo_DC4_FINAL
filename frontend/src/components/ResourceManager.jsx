import { useState } from 'react';
import useFetch from '../hooks/useFetch';
import useDebounce from '../hooks/useDebounce';
import { parseError } from '../services/api';
import { useToast } from '../context/ToastContext';
import Button from './Button';
import DataTable from './DataTable';
import Pagination from './Pagination';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';
import FormInput from './FormInput';
import Alert from './Alert';
import Icon from './Icon';

/**
 * Generic admin CRUD screen (list + search + pagination + create/edit modal + delete confirm).
 * Used by the Authors and Categories pages.
 *
 * props:
 *  title, singular   - labels
 *  api               - { list, create, update, remove }
 *  fields            - [{ name, label, as?, required?, max? }]
 *  columns           - table columns (actions column is added automatically)
 */
export default function ResourceManager({ title, singular, api, fields, columns, deleteMessage }) {
  const notify = useToast();
  const emptyForm = Object.fromEntries(fields.map((f) => [f.name, '']));

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search);

  const [editing, setEditing] = useState(null); // null | 'new' | record
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { data, meta, loading, error, reload } = useFetch(
    () => api.list({ search: debounced || undefined, page }),
    [debounced, page]
  );

  const openForm = (record) => {
    setEditing(record ?? 'new');
    setForm(record ? Object.fromEntries(fields.map((f) => [f.name, record[f.name] ?? ''])) : emptyForm);
    setErrors({});
    setFormError('');
  };

  const validate = () => {
    const found = {};
    fields.forEach((f) => {
      const value = String(form[f.name] ?? '').trim();
      const required = f.required && (!f.requiredOnCreate || editing === 'new');
      if (required && !value) found[f.name] = `${f.label} is required.`;
      else if (f.min && value && value.length < f.min) found[f.name] = `${f.label} must be at least ${f.min} characters.`;
      else if (f.max && value.length > f.max) found[f.name] = `${f.label} must be at most ${f.max} characters.`;
    });
    return found;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clientErrors = validate();
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) return;

    setSaving(true);
    setFormError('');
    try {
      if (editing === 'new') await api.create(form);
      else await api.update(editing.id, form);
      notify.success(`${singular} ${editing === 'new' ? 'created' : 'updated'} successfully.`);
      setEditing(null);
      reload();
    } catch (err) {
      const parsed = parseError(err);
      // 422 -> show each message under its field
      setErrors(Object.fromEntries(Object.entries(parsed.errors).map(([k, v]) => [k, v[0]])));
      setFormError(parsed.status === 422 ? '' : parsed.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.remove(toDelete.id);
      notify.success(`${singular} deleted.`);
      setToDelete(null);
      if (data.length === 1 && page > 1) setPage(page - 1);
      else reload();
    } catch (err) {
      notify.error(parseError(err).message);
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const tableColumns = [
    ...columns,
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="row-actions">
          <Button
            size="sm"
            variant="secondary"
            iconOnly
            aria-label={`Edit ${singular.toLowerCase()} ${row.name}`}
            title={`Edit ${row.name}`}
            onClick={() => openForm(row)}
          >
            <Icon name="edit" />
          </Button>
          <Button
            size="sm"
            variant="danger"
            iconOnly
            aria-label={`Delete ${singular.toLowerCase()} ${row.name}`}
            title={`Delete ${row.name}`}
            onClick={() => setToDelete(row)}
          >
            <Icon name="trash" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>{title}</h1>
          <p className="page-subtitle">Manage your library {title.toLowerCase()}.</p>
        </div>
        <Button onClick={() => openForm(null)}><Icon name="plus" /> Add {singular}</Button>
      </div>

      <div className="toolbar">
        <input
          type="search"
          placeholder={`Search ${title.toLowerCase()}…`}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <DataTable columns={tableColumns} rows={data} loading={loading} error={error} onRetry={reload} emptyMessage={`No ${title.toLowerCase()} found.`} />
      <Pagination meta={meta} onPageChange={setPage} />

      <Modal open={Boolean(editing)} title={editing === 'new' ? `Add ${singular}` : `Edit ${singular}`} onClose={() => setEditing(null)}>
        <form onSubmit={handleSubmit} noValidate>
          <Alert>{formError}</Alert>
          {fields.map((f) => (
            <FormInput
              key={f.name}
              name={f.name}
              type={f.type}
              autoComplete={f.autoComplete}
              minLength={f.min}
              label={(editing !== 'new' && f.editLabel ? f.editLabel : f.label) + (f.required && (!f.requiredOnCreate || editing === 'new') ? ' *' : '')}
              as={f.as}
              rows={f.as === 'textarea' ? 4 : undefined}
              value={form[f.name]}
              error={errors[f.name]}
              onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
            />
          ))}
          <div className="modal-actions">
            <Button type="button" variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" loading={saving}>Save</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={`Delete ${singular}`}
        message={typeof deleteMessage === 'function'
          ? deleteMessage(toDelete)
          : deleteMessage || `Are you sure you want to delete "${toDelete?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </section>
  );
}
