import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { dashboardApi } from '../services/library';
import useFetch from '../hooks/useFetch';
import Button from './Button';
import Icon from './Icon';

export default function Layout() {
  const { user, isAdmin, logout } = useAuth();
  const notify = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('library-theme') === 'dark');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const readStorageKey = `library-notifications-read:${user.id}`;
  const [readCounts, setReadCounts] = useState({});
  const { data: dashboard, reload } = useFetch(() => dashboardApi.get(), []);
  const stats = dashboard?.stats || {};
  const notifications = [
    { id: 'pending', label: isAdmin ? 'Book requests need review' : 'Requests awaiting review', count: stats.pending_requests || 0, icon: 'clock', tone: 'notification-pending' },
    { id: 'overdue', label: isAdmin ? 'Loans are overdue' : 'Your loans are overdue', count: stats.overdue_loans || 0, icon: 'alert', tone: 'notification-overdue' },
  ].filter((item) => item.count > 0);
  const unreadNotifications = notifications.filter((item) => item.count > (readCounts[item.id] || 0));
  const notificationCount = unreadNotifications.reduce((total, item) => total + item.count - (readCounts[item.id] || 0), 0);
  const displayName = isAdmin ? (user.name || 'Library Admin') : user.name;
  const initials = (displayName || 'U').trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    localStorage.setItem('library-theme', dark ? 'dark' : 'light');
  }, [dark]);
  useEffect(() => {
    try { const stored = JSON.parse(localStorage.getItem(readStorageKey) || '{}'); setReadCounts(stored && typeof stored === 'object' ? stored : {}); }
    catch { setReadCounts({}); }
  }, [readStorageKey]);

  const markAllAsRead = () => {
    const updated = { ...readCounts };
    notifications.forEach(({ id, count }) => { updated[id] = Math.max(updated[id] || 0, count); });
    try { localStorage.setItem(readStorageKey, JSON.stringify(updated)); } catch {}
    setReadCounts(updated);
  };
  const handleLogout = async () => { await logout(); notify.success('You have been logged out.'); navigate('/login'); };
  const link = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`;

  return <div className="app-shell">
    <aside className={`sidebar${open ? ' sidebar-open' : ''}`}>
      <Link to="/" className="brand" aria-label="Book Library home"><span className="brand-mark"><Icon name="book" size={25} /></span><span className="brand-copy"><strong>Book Library</strong><small>MANAGEMENT SYSTEM</small></span></Link>
      <nav className="nav" onClick={() => setOpen(false)}>
        <NavLink to="/" end className={link}><Icon name="home" size={18}/><span>Dashboard</span></NavLink>
        <NavLink to="/books" className={link}><Icon name="book" size={18}/><span>Books</span></NavLink>
        <NavLink to="/borrowings" className={link}><Icon name="calendar" size={18}/><span>{isAdmin ? 'Borrowings' : 'My Borrowings'}</span></NavLink>
        {isAdmin && <NavLink to="/members" className={link}><Icon name="members" size={18}/><span>Users</span></NavLink>}
        {isAdmin && <NavLink to="/authors" className={link}><Icon name="users" size={18}/><span>Authors</span></NavLink>}
        {isAdmin && <NavLink to="/categories" className={link}><Icon name="grid" size={18}/><span>Categories</span></NavLink>}
      </nav>
      <div className="sidebar-bottom"><div className="theme-switch"><Icon name="sun" size={18}/><button type="button" className={`switch${dark ? ' switch-on' : ''}`} onClick={() => setDark(v => !v)} aria-label="Toggle light and dark theme"><span/></button><Icon name="moon" size={18}/></div><div className="sidebar-profile"><span className="user-avatar">{initials}</span><span className="user-details"><strong>{displayName}</strong><small>{user.role}</small></span><button type="button" className="logout-icon" title="Sign out" aria-label="Sign out" onClick={handleLogout}><Icon name="logout" size={18}/></button></div></div>
    </aside>
    {open && <button className="sidebar-scrim" aria-label="Close menu" onClick={() => setOpen(false)} />}
    <div className="main-area">
      <header className="topbar"><button className="menu-toggle" onClick={() => setOpen(v => !v)} aria-label="Toggle menu"><Icon name="menu" size={21}/></button><div className="top-search"><Icon name="search" size={19}/><input type="search" placeholder="Search books, members..." onKeyDown={(e) => { if (e.key === 'Enter' && e.currentTarget.value.trim()) navigate(`/books?search=${encodeURIComponent(e.currentTarget.value.trim())}`); }}/></div><div className="topbar-actions"><div className="notification-wrap"><button className="notification-button" type="button" aria-label="Notifications" aria-expanded={notificationsOpen} onClick={() => { setNotificationsOpen(v => !v); reload?.(); }}><Icon name="bell" size={19}/>{notificationCount > 0 && <span className="notification-count">{notificationCount > 9 ? '9+' : notificationCount}</span>}</button>{notificationsOpen && <div className="notification-popover"><div className="notification-heading"><div><strong>Notifications</strong><small>{notificationCount ? `${notificationCount} unread record${notificationCount === 1 ? '' : 's'}` : 'You’re all caught up'}</small></div><button className="icon-btn" onClick={() => setNotificationsOpen(false)} aria-label="Close"><Icon name="close" size={17}/></button></div>{notifications.length > 0 && <div className="notification-tools"><span>{unreadNotifications.length ? 'New alerts' : 'All alerts are read'}</span><button className="notification-mark-read" disabled={!unreadNotifications.length} onClick={markAllAsRead}><Icon name="checkCircle" size={15}/> Mark all as read</button></div>}{notifications.length ? <div className="notification-list">{notifications.map(item => { const read = item.count <= (readCounts[item.id] || 0); return <Link key={item.id} to="/borrowings" className={`notification-item ${item.tone}${read ? ' notification-read' : ''}`} onClick={() => setNotificationsOpen(false)}><span className="notification-icon"><Icon name={item.icon} size={18}/></span><span className="notification-copy"><strong>{item.label}</strong><small>{item.count} {item.count === 1 ? 'record' : 'records'} · {read ? 'Read' : 'Unread'}</small></span></Link>; })}</div> : <p className="notification-empty">No new library alerts.</p>}</div>}</div><span className="top-avatar">{initials}</span></div></header>
      <main className="content"><Outlet/></main>
    </div>
  </div>;
}
