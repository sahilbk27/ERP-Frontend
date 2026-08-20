import { useEffect, useState } from 'react';
import api from '../api/axios';
import StatusPill from '../components/StatusPill';

const emptyLine = () => ({ itemId: '', quantity: 1, unitPrice: '' });

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [customerId, setCustomerId] = useState('');
  const [lines, setLines] = useState([emptyLine()]);
  const [submitting, setSubmitting] = useState(false);

  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '' });
  const [customerSubmitting, setCustomerSubmitting] = useState(false);

  async function loadAll() {
    setLoading(true);
    try {
      const [ordersRes, customersRes, itemsRes] = await Promise.all([
        api.get('/sales-service/api/orders'),
        api.get('/sales-service/api/customers'),
        api.get('/inventory-service/api/items'),
      ]);
      setOrders(ordersRes.data);
      setCustomers(customersRes.data);
      setItems(itemsRes.data);
    } catch {
      setError('Could not load orders. Confirm Sales and Inventory services are reachable.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  function updateLine(index, field, value) {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, [field]: value } : line)));
  }

  function addLine() {
    setLines((prev) => [...prev, emptyLine()]);
  }

  function removeLine(index) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleCreateCustomer(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newCustomer.name.trim()) {
      setError('Customer name is required.');
      return;
    }

    setCustomerSubmitting(true);
    try {
      const res = await api.post('/sales-service/api/customers', newCustomer);
      setSuccess(`Customer "${res.data.name}" added.`);
      setNewCustomer({ name: '', email: '', phone: '' });
      loadAll();
      setCustomerId(String(res.data.id)); // pre-select it for the order form below
    } catch (err) {
      setError(err.response?.data || 'Could not create customer.');
    } finally {
      setCustomerSubmitting(false);
    }
  }

  async function handleCreateOrder(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!customerId) {
      setError('Select a customer before placing the order.');
      return;
    }

    const payloadItems = lines.map((line) => {
      const item = items.find((i) => String(i.id) === String(line.itemId));
      return {
        itemId: Number(line.itemId),
        itemSku: item?.sku || '',
        quantity: Number(line.quantity),
        unitPrice: Number(line.unitPrice),
      };
    });

    if (payloadItems.some((l) => !l.itemId || !l.quantity || !l.unitPrice)) {
      setError('Every line needs an item, quantity, and unit price.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/sales-service/api/orders', {
        customerId: Number(customerId),
        items: payloadItems,
      });
      setSuccess(`Order ${res.data.orderNumber} created — awaiting stock confirmation.`);
      setLines([emptyLine()]);
      setCustomerId('');
      loadAll();
    } catch (err) {
      setError(err.response?.data || 'Could not create the order.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Sales</div>
          <div className="page-title">Sales orders</div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">Customers</span>
        </div>
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Phone</th></tr>
          </thead>
          <tbody>
            {!loading && customers.length === 0 && (
              <tr className="empty-row"><td colSpan={3}>No customers yet — add one below.</td></tr>
            )}
            {customers.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td className="mono">{c.email || '—'}</td>
                <td className="mono">{c.phone || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <form onSubmit={handleCreateCustomer} className="form-grid">
          <div className="field">
            <label>Name</label>
            <input
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={newCustomer.email}
              onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Phone</label>
            <input
              value={newCustomer.phone}
              onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
            />
          </div>
          <div className="field" style={{ justifyContent: 'flex-end' }}>
            <button className="btn" type="submit" disabled={customerSubmitting}>
              {customerSubmitting ? 'Adding…' : '+ Add customer'}
            </button>
          </div>
        </form>
      </div>

      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">New order</span>
        </div>
        <form onSubmit={handleCreateOrder}>
          <div className="form-grid" style={{ paddingBottom: 0 }}>
            <div className="field">
              <label htmlFor="customer">Customer</label>
              <select id="customer" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                <option value="">Select customer…</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {lines.map((line, index) => (
            <div className="line-item-row" key={index}>
              <div className="field">
                <label>Item</label>
                <select
                  value={line.itemId}
                  onChange={(e) => updateLine(index, 'itemId', e.target.value)}
                >
                  <option value="">Select item…</option>
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>{i.sku} — {i.name}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={line.quantity}
                  onChange={(e) => updateLine(index, 'quantity', e.target.value)}
                />
              </div>
              <div className="field">
                <label>Unit price</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={line.unitPrice}
                  onChange={(e) => updateLine(index, 'unitPrice', e.target.value)}
                />
              </div>
              <button
                type="button"
                className="remove-line-btn"
                onClick={() => removeLine(index)}
                disabled={lines.length === 1}
              >
                Remove
              </button>
            </div>
          ))}

          <button type="button" className="btn add-line-btn" onClick={addLine}>+ Add line</button>

          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Placing order…' : 'Place order'}
            </button>
          </div>
        </form>
      </div>

      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">All orders</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Status</th>
              <th>Items</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {!loading && orders.length === 0 && (
              <tr className="empty-row"><td colSpan={4}>No orders yet — place one above.</td></tr>
            )}
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="mono">{o.orderNumber}</td>
                <td><StatusPill status={o.status} /></td>
                <td>{o.items?.length ?? 0}</td>
                <td className="mono">{o.createdAt ? new Date(o.createdAt).toLocaleString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
