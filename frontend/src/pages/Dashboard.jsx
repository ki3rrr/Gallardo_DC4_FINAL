import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import useFetch from '../hooks/useFetch';
import { dashboardApi } from '../services/library';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import StatusBadge from '../components/StatusBadge';
import Icon from '../components/Icon';

const ADMIN_CARDS = [
  ['total_books', 'Book titles', 'book'],
  ['total_members', 'Members', 'members'],
  ['pending_requests', 'Pending requests', 'clock'],
  ['active_loans', 'Active loans', 'book'],
  ['overdue_loans', 'Overdue loans', 'alert'],
  ['returned_this_week', 'Returned this week', 'check'],
];

const MEMBER_CARDS = [
  ['pending_requests', 'Pending requests', 'clock'],
  ['active_loans', 'Books I have', 'book'],
  ['overdue_loans', 'Overdue', 'alert'],
  ['books_returned', 'Books returned', 'check'],
];

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const { data, loading, error, reload } = useFetch(() => dashboardApi.get(), []);

  if (loading) return <Spinner label="Loading dashboard…" />;
  if (error) return <Alert onRetry={reload}>{error}</Alert>;

  const cards = isAdmin ? ADMIN_CARDS : MEMBER_CARDS;

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">{isAdmin ? 'LIBRARY OVERVIEW' : 'YOUR LIBRARY'}</p>
          <h1>Welcome, {isAdmin ? 'Kier' : user.name.split(' ')[0]}</h1>
          <p className="page-subtitle">{isAdmin ? 'Here’s what needs your attention today.' : 'Your reading and borrowing activity at a glance.'}</p>
        </div>
        {isAdmin && <Link className="btn btn-secondary dashboard-quick-link" to="/members"><Icon name="members" /> Manage members</Link>}
      </div>

      <div className="stat-grid">
        {cards.map(([key, label, icon]) => (
          <div key={key} className={`stat-card ${key === 'overdue_loans' && data.stats[key] > 0 ? 'stat-warn' : ''}`}>
            <span className={`stat-icon stat-icon-${icon}`}><Icon name={icon} size={22} /></span>
            <div>
              <div className="stat-value">{data.stats[key]}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {isAdmin && data.charts && (
        <div className="chart-grid">
          <div className="panel">
            <h3>Borrowings by status</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.charts.by_status}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="total" fill="#2e6652" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="panel">
            <h3>Most borrowed categories</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.charts.by_category} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={130} />
                <Tooltip />
                <Bar dataKey="total" fill="#9aab80" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <h3>{isAdmin ? 'Latest pending requests' : 'My recent activity'}</h3>
          <Link to="/borrowings">View all →</Link>
        </div>
        {data.recent.length === 0 ? (
          <div className="empty-state">Nothing here yet.</div>
        ) : (
          <ul className="activity-list">
            {data.recent.map((b) => (
              <li key={b.id}>
                <div>
                  <strong>{b.book.title}</strong>
                  <small>
                    {isAdmin ? `${b.user.name} • ` : ''}
                    requested {b.requested_at}
                    {b.due_date ? ` • due ${b.due_date}` : ''}
                  </small>
                </div>
                <StatusBadge status={b.status} overdue={b.is_overdue} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
