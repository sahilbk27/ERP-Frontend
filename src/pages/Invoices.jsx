import { useEffect, useState } from 'react';
import api from '../api/axios';
import StatusPill from '../components/StatusPill';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/finance-service/api/invoices')
      .then((res) => setInvoices(res.data))
      .catch(() => setError('Could not load invoices. Confirm the Finance service is reachable.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Finance</div>
          <div className="page-title">Invoices</div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">All invoices</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Order #</th>
              <th>Status</th>
              <th>Total</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {!loading && invoices.length === 0 && (
              <tr className="empty-row">
                <td colSpan={5}>No invoices yet — they're generated automatically when an order's stock is confirmed.</td>
              </tr>
            )}
            {invoices.map((inv) => (
              <>
                <tr
                  key={inv.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setExpandedId(expandedId === inv.id ? null : inv.id)}
                >
                  <td className="mono">{inv.invoiceNumber}</td>
                  <td className="mono">{inv.orderNumber}</td>
                  <td><StatusPill status={inv.status} /></td>
                  <td className="mono">{Number(inv.totalAmount).toFixed(2)}</td>
                  <td className="mono">{inv.createdAt ? new Date(inv.createdAt).toLocaleString() : '—'}</td>
                </tr>
                {expandedId === inv.id && (
                  <tr>
                    <td colSpan={5} style={{ background: 'var(--bg-2)', padding: 0 }}>
                      <table>
                        <thead>
                          <tr>
                            <th>Item ID</th>
                            <th>Qty</th>
                            <th>Unit price</th>
                            <th>Line total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(inv.lines || []).map((line) => (
                            <tr key={line.id}>
                              <td className="mono">{line.itemId}</td>
                              <td className="mono">{line.quantity}</td>
                              <td className="mono">{Number(line.unitPrice).toFixed(2)}</td>
                              <td className="mono">{Number(line.lineTotal).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
