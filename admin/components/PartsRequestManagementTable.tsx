
import type { SparePartOrder } from '../../shared/lib/db';

interface PartsRequestManagementTableProps {
  partsRequests: SparePartOrder[];
  onSelectedPartsRequest: (request: SparePartOrder) => void;
  onUpdateStatus: (id: string, status: SparePartOrder['status']) => void;
}

export const PartsRequestManagementTable = ({ partsRequests, onSelectedPartsRequest, onUpdateStatus }: PartsRequestManagementTableProps) => {
  return (
    <div className="glass" style={{ borderRadius: '1.5rem', overflow: 'hidden' }}>
      <div className="responsive-table-wrapper" style={{width: "100%"}}>
<table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-glass)' }}>
            <th style={{ padding: '1.5rem', textAlign: 'left' }}>Part Details</th>
            <th style={{ padding: '1.5rem', textAlign: 'left' }}>Vehicle Compatibility</th>
            <th style={{ padding: '1.5rem', textAlign: 'left' }}>Quantity</th>
            <th style={{ padding: '1.5rem', textAlign: 'left' }}>Status</th>
            <th style={{ padding: '1.5rem', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {partsRequests.map((item) => (
            <tr key={item.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
              <td style={{ padding: '1.5rem' }}>
                <div style={{ fontWeight: 600 }}>{item.part_name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.description || 'No additional details'}</div>
              </td>
              <td style={{ padding: '1.5rem' }}>
                <div style={{ fontWeight: 600 }}>{item.vehicle_make} {item.vehicle_model}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Year: {item.vehicle_year}</div>
              </td>
              <td style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: '1rem', fontWeight: 600 }}>{item.quantity}</div>
              </td>
              <td style={{ padding: '1.5rem' }}>
                <span style={{ 
                  padding: '0.3rem 0.6rem', 
                  borderRadius: '1rem', 
                  fontSize: '0.7rem', 
                  fontWeight: 700, 
                  background: item.status === 'Pending' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(74, 222, 128, 0.1)',
                  color: item.status === 'Pending' ? '#eab308' : '#4ade80',
                  border: `1px solid ${item.status === 'Pending' ? 'rgba(234, 179, 8, 0.3)' : 'rgba(74, 222, 128, 0.3)'}`
                }}>
                  {item.status.toUpperCase()}
                </span>
              </td>
              <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button onClick={() => onSelectedPartsRequest(item)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white', borderRadius: '4px' }}>VIEW DETAILS</button>
                    {item.status === 'Pending' && (
                      <button onClick={() => onUpdateStatus(item.id, 'Sourced')} className="btn-gold" style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem' }}>MARK SOURCED</button>
                    )}
                    {item.status === 'Sourced' && (
                      <button onClick={() => onUpdateStatus(item.id, 'Shipped')} className="btn-gold" style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem' }}>MARK SHIPPED</button>
                    )}
                  </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
</div>
    </div>
  );
};
