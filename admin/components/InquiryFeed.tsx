
import type { Inquiry } from '../../shared/lib/db';

interface InquiryFeedProps {
  inquiries: Inquiry[];
  onViewDetails: (inquiry: Inquiry) => void;
  onMarkContacted: (id: string) => void;
  onArchive: (id: string) => void;
}

export const InquiryFeed = ({ inquiries, onViewDetails, onMarkContacted, onArchive }: InquiryFeedProps) => {
  return (
    <div className="glass" style={{ borderRadius: '1.5rem', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-glass)' }}>
            <th style={{ padding: '1.5rem', textAlign: 'left' }}>Prospect</th>
            <th style={{ padding: '1.5rem', textAlign: 'left' }}>Vehicle / Type</th>
            <th style={{ padding: '1.5rem', textAlign: 'left' }}>Status</th>
            <th style={{ padding: '1.5rem', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {inquiries.map((item) => (
            <tr key={item.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
              <td style={{ padding: '1.5rem' }}>
                <div style={{ fontWeight: 600 }}>{item.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.email}</div>
                {item.phone && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.phone}</div>}
              </td>
              <td style={{ padding: '1.5rem' }}>
                <div style={{ fontWeight: 600 }}>{item.carName || 'General Inquiry'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', textTransform: 'uppercase' }}>{item.type}</div>
              </td>
              <td style={{ padding: '1.5rem' }}>
                <span style={{ 
                  padding: '0.3rem 0.6rem', 
                  borderRadius: '1rem', 
                  fontSize: '0.7rem', 
                  fontWeight: 700, 
                  background: item.status === 'New' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(74, 222, 128, 0.1)',
                  color: item.status === 'New' ? '#eab308' : '#4ade80',
                  border: `1px solid ${item.status === 'New' ? 'rgba(234, 179, 8, 0.3)' : 'rgba(74, 222, 128, 0.3)'}`
                }}>
                  {item.status.toUpperCase()}
                </span>
              </td>
              <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button onClick={() => onViewDetails(item)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white', borderRadius: '4px', marginRight: '0.5rem' }}>VIEW DETAILS</button>
                    <button onClick={() => onMarkContacted(item.id)} className="btn-gold" style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem' }}>MARK CONTACTED</button>
                    <button onClick={() => onArchive(item.id)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem', background: '#333', border: 'none', color: 'white', borderRadius: '4px' }}>ARCHIVE</button>
                  </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
