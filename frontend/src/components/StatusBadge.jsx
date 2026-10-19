/** Colored badge for a borrowing status (shows "overdue" for late approved loans). */
import Icon from './Icon';

export default function StatusBadge({ status, overdue = false }) {
  const key = overdue ? 'overdue' : status;
  const label = overdue ? 'Overdue' : status.charAt(0).toUpperCase() + status.slice(1);
  const icon = {
    pending: 'clock',
    approved: 'checkCircle',
    returned: 'checkCircle',
    rejected: 'xCircle',
    overdue: 'alert',
  }[key] || 'clock';

  return (
    <span className={`badge badge-${key} status-badge`}>
      <Icon name={icon} size={14} />
      {label}
    </span>
  );
}
