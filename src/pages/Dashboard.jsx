import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import StatusPill from '../components/StatusPill';

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [ordersRes, invoicesRes, itemsRes] = await Promise.allSettled([
          api.get('/sales-service/api/orders'),
          api.get('/finance-service/api/invoices'),
          api.get('/inventory-service/api/items'),
        ]);

        if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value.data);
        if (invoicesRes.status === 'fulfilled') setInvoices(invoicesRes.value.data);
        if (itemsRes.status === 'fulfilled') setItems(itemsRes.value.data);

        if ([ordersRes, invoicesRes, itemsRes].every((r) => r.status === 'rejected')) {
          setError('Could not reach the backend services. Confirm the Gateway and services are running.');
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const confirmedCount = orders.filter((o) => o.status === 'CONFIRMED').length;
  const pendingCount = orders.filter((o) => o.status === 'CREATED').length;
  const unpaidTotal = invoices
    .filter((i) => i.status === 'UNPAID')
    .reduce((sum, i) => sum + Number(i.totalAmount || 0), 0);

  const recentOrders = [...orders]
    .sort((a, b) => (b.id || 0) - (a.id || 0))
    .slice(0, 6);

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">System overview</div>
          <div className="page-title">Overview</div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Sales orders</div>
          <div className="stat-value">{loading ? '—' : orders.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Confirmed</div>
          <div className="stat-value accent">{loading ? '—' : confirmedCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending stock check</div>
          <div className="stat-value">{loading ? '—' : pendingCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Items tracked</div>
          <div className="stat-value">{loading ? '—' : items.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Unpaid invoice total</div>
          <div className="stat-value">{loading ? '—' : unpaidTotal.toFixed(2)}</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">Recent orders</span>
          <Link to="/orders" className="btn">View all →</Link>
        </div>
        <table>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length === 0 && !loading && (
              <tr className="empty-row"><td colSpan={3}>No orders placed yet.</td></tr>
            )}
            {recentOrders.map((o) => (
              <tr key={o.id}>
                <td className="mono">{o.orderNumber}</td>
                <td><StatusPill status={o.status} /></td>
                <td className="mono">{o.createdAt ? new Date(o.createdAt).toLocaleString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
