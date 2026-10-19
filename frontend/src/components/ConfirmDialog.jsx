import { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import FormInput from './FormInput';

/** "Are you sure?" step (used before deleting, approving, rejecting...). Optional note box. */
export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  danger = false,
  withNote = false,
  noteLabel = 'Note (optional)',
  loading = false,
  onConfirm,
  onCancel,
}) {
  const [note, setNote] = useState('');

  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p>{message}</p>
      {withNote && (
        <FormInput
          as="textarea"
          rows={3}
          name="note"
          label={noteLabel}
          maxLength={255}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      )}
      <div className="modal-actions">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant={danger ? 'danger' : 'primary'}
          loading={loading}
          onClick={() => {
            onConfirm(note);
            setNote('');
          }}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
