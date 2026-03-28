import { StatusBadge } from './StatusBadge';
import { formatPrice } from '../../shared/lib/formatters';
import type { Order } from '../../shared/lib/db';

interface OrderManagementTableProps {
  orders: Order[];
  onSelectedOrder: (order: Order) => void;
}

export const OrderManagementTable = ({ orders, onSelectedOrder }: OrderManagementTableProps) => {
  return (
    <div className="glass" style={{ borderRadius: '1.5rem', overflow: 'hidden' }}>
      <div className="responsive-table-wrapper" style={{width: "100%"}}>
<table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-glass)' }}>
            <th style={{ padding: '1.5rem', textAlign: 'left' }}>Order ID</th>
            <th style={{ padding: '1.5rem', textAlign: 'left' }}>Amount</th>
            <th style={{ padding: '1.5rem', textAlign: 'left' }}>Status</th>
            <th style={{ padding: '1.5rem', textAlign: 'right' }}>Manage</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((item) => (
            <tr key={item.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
              <td style={{ padding: '1.5rem', color: 'var(--text-muted)' }}>#{item.id.slice(0, 8)}</td>
              <td style={{ padding: '1.5rem' }}>{formatPrice(item.amount)}</td>
              <td style={{ padding: '1.5rem' }}><StatusBadge status={item.status} /></td>
              <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                <button onClick={() => onSelectedOrder(item)} className="btn-gold" style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem' }}>VIEW DOSSIER</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
</div>
    </div>
  );
};
