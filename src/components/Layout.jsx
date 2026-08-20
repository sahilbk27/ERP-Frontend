import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/', label: 'Overview', index: '01', end: true },
  { to: '/orders', label: 'Sales Orders', index: '02' },
  { to: '/inventory', label: 'Inventory', index: '03' },
  { to: '/invoices', label: 'Invoices', index: '04' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark" />
          <div>
            <div className="brand-name">ERP Console</div>
            <div className="brand-sub">Ops Backend</div>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <span className="nav-index">{item.index}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-row">
            <span>{user?.username}</span>
            <span className="role-pill">{user?.role}</span>
          </div>
          <button className="logout-btn" onClick={logout}>Sign out →</button>
        </div>
      </aside>

      <main className="main">{children}</main>
    </div>
  );
}
