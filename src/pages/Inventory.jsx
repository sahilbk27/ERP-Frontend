import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [stockByItem, setStockByItem] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newItem, setNewItem] = useState({ sku: '', name: '', description: '' });
  const [newWarehouse, setNewWarehouse] = useState({ name: '', location: '' });
  const [adjust, setAdjust] = useState({ itemId: '', warehouseId: '', delta: '' });
  const [submitting, setSubmitting] = useState(false);

  async function loadAll() {
    setLoading(true);
    try {
      const [itemsRes, warehousesRes] = await Promise.all([
        api.get('/inventory-service/api/items'),
        api.get('/inventory-service/api/warehouses'),
      ]);
      setItems(itemsRes.data);
      setWarehouses(warehousesRes.data);

      const stockEntries = await Promise.all(
        itemsRes.data.map((item) =>
          api.get(`/inventory-service/api/stock/item/${item.id}`).then((res) => [item.id, res.data])
        )
      );
      setStockByItem(Object.fromEntries(stockEntries));
    } catch {
      setError('Could not load inventory. Confirm the Inventory service is reachable.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  async function handleCreateItem(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    setSubmitting(true);
    try {
      await api.post('/inventory-service/api/items', newItem);
      setNewItem({ sku: '', name: '', description: '' });
      setSuccess('Item created.');
      loadAll();
    } catch (err) {
      setError(err.response?.data || 'Could not create item.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateWarehouse(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    setSubmitting(true);
    try {
      await api.post('/inventory-service/api/warehouses', newWarehouse);
      setNewWarehouse({ name: '', location: '' });
      setSuccess('Warehouse created.');
      loadAll();
    } catch (err) {
      setError(err.response?.data || 'Could not create warehouse.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAdjust(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!adjust.itemId || !adjust.warehouseId || !adjust.delta) {
      setError('Item, warehouse, and quantity change are all required.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/inventory-service/api/stock/adjust', {
        itemId: Number(adjust.itemId),
        warehouseId: Number(adjust.warehouseId),
        delta: Number(adjust.delta),
      });
      setSuccess('Stock adjusted.');
      setAdjust({ itemId: '', warehouseId: '', delta: '' });
      loadAll();
    } catch (err) {
      setError(err.response?.data || 'Stock adjustment failed — check available quantity.');
    } finally {
      setSubmitting(false);
    }
  }

  function totalStock(itemId) {
    const rows = stockByItem[itemId] || [];
    return rows.reduce((sum, r) => sum + r.quantity, 0);
  }

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Warehouse</div>
          <div className="page-title">Inventory</div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="panel">
        <div className="panel-head"><span className="panel-title">Adjust stock</span></div>
        <form onSubmit={handleAdjust}>
          <div className="form-grid">
            <div className="field">
              <label>Item</label>
              <select value={adjust.itemId} onChange={(e) => setAdjust({ ...adjust, itemId: e.target.value })}>
                <option value="">Select item…</option>
                {items.map((i) => <option key={i.id} value={i.id}>{i.sku} — {i.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Warehouse</label>
              <select value={adjust.warehouseId} onChange={(e) => setAdjust({ ...adjust, warehouseId: e.target.value })}>
                <option value="">Select warehouse…</option>
                {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Quantity change (+/-)</label>
              <input
                type="number"
                placeholder="e.g. 50 or -10"
                value={adjust.delta}
                onChange={(e) => setAdjust({ ...adjust, delta: e.target.value })}
              />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={submitting}>Apply adjustment</button>
          </div>
        </form>
      </div>

      <div className="panel">
        <div className="panel-head"><span className="panel-title">Items &amp; stock on hand</span></div>
        <table>
          <thead>
            <tr><th>SKU</th><th>Name</th><th>Total stock</th></tr>
          </thead>
          <tbody>
            {!loading && items.length === 0 && (
              <tr className="empty-row"><td colSpan={3}>No items yet — add one below.</td></tr>
            )}
            {items.map((i) => (
              <tr key={i.id}>
                <td className="mono">{i.sku}</td>
                <td>{i.name}</td>
                <td className="mono">{totalStock(i.id)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <form onSubmit={handleCreateItem} className="form-grid">
          <div className="field">
            <label>SKU</label>
            <input value={newItem.sku} onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })} required />
          </div>
          <div className="field">
            <label>Name</label>
            <input value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} required />
          </div>
          <div className="field">
            <label>Description</label>
            <input value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} />
          </div>
          <div className="field" style={{ justifyContent: 'flex-end' }}>
            <button className="btn" type="submit" disabled={submitting}>+ Add item</button>
          </div>
        </form>
      </div>

      <div className="panel">
        <div className="panel-head"><span className="panel-title">Warehouses</span></div>
        <table>
          <thead><tr><th>Name</th><th>Location</th></tr></thead>
          <tbody>
            {!loading && warehouses.length === 0 && (
              <tr className="empty-row"><td colSpan={2}>No warehouses yet — add one below.</td></tr>
            )}
            {warehouses.map((w) => (
              <tr key={w.id}><td>{w.name}</td><td>{w.location}</td></tr>
            ))}
          </tbody>
        </table>
        <form onSubmit={handleCreateWarehouse} className="form-grid">
          <div className="field">
            <label>Name</label>
            <input value={newWarehouse.name} onChange={(e) => setNewWarehouse({ ...newWarehouse, name: e.target.value })} required />
          </div>
          <div className="field">
            <label>Location</label>
            <input value={newWarehouse.location} onChange={(e) => setNewWarehouse({ ...newWarehouse, location: e.target.value })} />
          </div>
          <div className="field" style={{ justifyContent: 'flex-end' }}>
            <button className="btn" type="submit" disabled={submitting}>+ Add warehouse</button>
          </div>
        </form>
      </div>
    </>
  );
}
