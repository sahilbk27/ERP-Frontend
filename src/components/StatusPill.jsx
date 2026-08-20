const STATUS_STYLES = {
  CREATED: 'pill-amber',
  CONFIRMED: 'pill-teal',
  CANCELLED: 'pill-red',
  UNPAID: 'pill-amber',
  PAID: 'pill-teal',
};

export default function StatusPill({ status }) {
  const cls = STATUS_STYLES[status] || 'pill-gray';
  return <span className={`pill ${cls}`}>{status}</span>;
}
