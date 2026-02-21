import { 
  Edit, Trash2, Eye, Pin, CheckCircle2, X 
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { formatPrice } from '../../shared/lib/formatters';
import type { Car } from '../../shared/lib/db';

interface CarManagementTableProps {
  cars: Car[];
  onEdit: (car: Car) => void;
  onDelete: (id: string) => void;
  onPin: (id: string, currentStatus: boolean | undefined) => void;
  onPreview: (car: Car) => void;
  onApproval: (id: string, status: 'approved' | 'rejected') => void;
}

export const CarManagementTable = ({ 
  cars,
  onEdit,
  onDelete,
  onPin,
  onPreview,
  onApproval
}: CarManagementTableProps) => {
  return (
    <div className="glass" style={{ borderRadius: '1.5rem', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-glass)' }}>
            <th style={{ padding: '1.5rem', textAlign: 'left' }}>Vehicle</th>
            <th style={{ padding: '1.5rem', textAlign: 'left' }}>Price</th>
            <th style={{ padding: '1.5rem', textAlign: 'left' }}>Vendor</th>
            <th style={{ padding: '1.5rem', textAlign: 'left' }}>Status</th>
            <th style={{ padding: '1.5rem', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {cars.map((item) => (
            <tr key={item.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
              <td style={{ padding: '1.5rem' }}>{item.year} {item.make} {item.model}</td>
              <td style={{ padding: '1.5rem' }}>{formatPrice(item.price)}</td>
              <td style={{ padding: '1.5rem' }}>
                {item.profiles?.business_name ? (
                  <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>{item.profiles.business_name}</span>
                ) : item.vendor_id ? (
                  'Vendor'
                ) : (
                  'Official'
                )}
              </td>
              <td style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <StatusBadge status={item.status} />
                  <StatusBadge status={item.approval_status || 'approved'} />
                </div>
              </td>
              <td style={{ padding: '1.5rem', textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  {item.approval_status === 'pending' && (
                    <>
                     <button onClick={() => onApproval(item.id, 'approved')} style={{ color: '#4ade80', background: 'none', border: 'none' }} title="Approve"><CheckCircle2 size={18} /></button>
                     <button onClick={() => onApproval(item.id, 'rejected')} style={{ color: '#ef4444', background: 'none', border: 'none' }} title="Reject"><X size={18} /></button>
                    </>
                  )}
                  <button onClick={() => onPreview(item)} style={{ color: 'var(--accent-gold)', background: 'none', border: 'none' }} title="Preview"><Eye size={18} /></button>
                  <button onClick={() => onPin(item.id, item.is_pinned)} style={{ color: item.is_pinned ? 'var(--accent-gold)' : 'var(--text-muted)', background: 'none', border: 'none' }} title={item.is_pinned ? "Unpin" : "Pin"}>
                    <Pin size={18} fill={item.is_pinned ? 'currentColor' : 'none'} />
                  </button>
                  <button onClick={() => onEdit(item)} style={{ color: 'white', background: 'none', border: 'none' }}><Edit size={16} /></button>
                  <button onClick={() => onDelete(item.id)} style={{ color: '#ef4444', background: 'none', border: 'none' }}><Trash2 size={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
