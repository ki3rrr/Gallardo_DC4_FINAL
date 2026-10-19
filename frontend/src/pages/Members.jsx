import Icon from '../components/Icon';
import ResourceManager from '../components/ResourceManager';
import { membersApi } from '../services/library';

const fields = [
  { name: 'name', label: 'Full name', required: true, max: 255 },
  { name: 'email', label: 'Email address', required: true, max: 255, type: 'email', autoComplete: 'email' },
  { name: 'phone', label: 'Phone number', max: 30, type: 'tel', autoComplete: 'tel' },
  {
    name: 'password',
    label: 'Temporary password',
    editLabel: 'New password (leave blank to keep current)',
    required: true,
    requiredOnCreate: true,
    min: 8,
    max: 255,
    type: 'password',
    autoComplete: 'new-password',
  },
];

const columns = [
  {
    key: 'name',
    header: 'Member',
    render: (member) => (
      <span className="member-cell">
        <span className="member-avatar">{member.name?.trim().charAt(0).toUpperCase() || 'M'}</span>
        <strong>{member.name}</strong>
      </span>
    ),
  },
  { key: 'email', header: 'Email' },
  { key: 'phone', header: 'Phone' },
  {
    key: 'borrowings_count',
    header: 'Loan history',
    render: (member) => (
      <span className="count-pill">
        <Icon name="book" size={15} />
        {member.borrowings_count ?? 0}
      </span>
    ),
  },
  { key: 'created_at', header: 'Member since' },
];

export default function Members() {
  return (
    <ResourceManager
      title="Members"
      singular="Member"
      api={membersApi}
      fields={fields}
      columns={columns}
      deleteMessage={(member) => `Delete ${member?.name}? Members with borrowing history cannot be deleted, so their library records stay intact.`}
    />
  );
}
