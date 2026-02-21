import { formatPrice } from '../../shared/lib/formatters';
import type { Preorder } from '../../shared/lib/db';

interface PreorderManagementTableProps {
  preorders: Preorder[];
  onSelectedPreorder: (preorder: Preorder) => void;
  onUpdateStatus: (id: string, status: Preorder['status']) => void;
}

export const PreorderManagementTable = ({ preorders, onSelectedPreorder, onUpdateStatus }: PreorderManagementTableProps) => {
  return (
    <div className="glass" style={{ borderRadius: '1.5rem', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-glass)' }}>
            <th style={{ padding: '1.5rem', textAlign: 'left' }}>Client</th>
            <th style={{ padding: '1.5rem', textAlign: 'left' }}>Requested Vehicle</th>
            <th style={{ padding: '1.5rem', textAlign: 'left' }}>Budget</th>
            <th style={{ padding: '1.5rem', textAlign: 'left' }}>Status</th>
            <th style={{ padding: '1.5rem', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {preorders.map((item) => (
            <tr key={item.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
              <td style={{ padding: '1.5rem' }}>
                <div style={{ fontWeight: 600 }}>{item.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.email}</div>
                {item.phone && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.phone}</div>}
              </td>
              <td style={{ padding: '1.5rem' }}>
                <div style={{ fontWeight: 600 }}>{item.year} {item.make} {item.model}</div>
              </td>
              <td style={{ padding: '1.5rem', fontWeight: 600, color: 'var(--accent-gold)' }}>
                {item.budget ? formatPrice(item.budget) : 'N/A'}
              </td>
              <td style={{ padding: '1.5rem' }}>
                <span style={{ 
                  padding: '0.3rem 0.6rem', 
                  borderRadius: '1rem', 
                  fontSize: '0.7rem', 
                  fontWeight: 700, 
                  background: item.status === 'Searching' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(74, 222, 128, 0.1)',
                  color: item.status === 'Searching' ? '#eab308' : '#4ade80',
                  border: `1px solid ${item.status === 'Searching' ? 'rgba(234, 179, 8, 0.3)' : 'rgba(74, 222, 128, 0.3)'}`
                }}>
                  {item.status.toUpperCase()}
                </span>
              </td>
              <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button onClick={() => onSelectedPreorder(item)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white', borderRadius: '4px', marginRight: '0.5rem' }}>VIEW DETAILS</button>
                    <button onClick={() => onUpdateStatus(item.id, 'Sourced')} className="btn-gold" style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem' }}>MARK SOURCED</button>
                    <button onClick={() => onUpdateStatus(item.id, 'Delivered')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem', background: 'rgba(74, 222, 128, 0.1)', border: 'none', color: '#4ade80', borderRadius: '4px' }}>MARK DELIVERED</button>
                  </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
