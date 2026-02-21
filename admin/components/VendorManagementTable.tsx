import { Video, Eye, MoreVertical } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import type { Profile } from '../../shared/lib/db';

interface VendorManagementTableProps {
  vendors: Profile[];
  vendorFilter: string;
  onVendorAction: (id: string, action: 'approved' | 'rejected') => void;
  onPreorderReview: (id: string, action: 'approved' | 'rejected') => void;
  onSelectVendor: (vendor: Profile) => void;
}

export const VendorManagementTable = ({
  vendors,
  vendorFilter,
  onVendorAction,
  onPreorderReview,
  onSelectVendor
}: VendorManagementTableProps) => {
  return (
    <div className="glass" style={{ borderRadius: '1.5rem', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-glass)' }}>
            <th style={{ padding: '1.5rem', textAlign: 'left' }}>Company</th>
            <th style={{ padding: '1.5rem', textAlign: 'left' }}>Contact</th>
            {vendorFilter === 'preorder_pending' && <th style={{ padding: '1.5rem', textAlign: 'left' }}>Evidence</th>}
            <th style={{ padding: '1.5rem', textAlign: 'left' }}>Status</th>
            <th style={{ padding: '1.5rem', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((item) => (
            <tr key={item.id} style={{ borderBottom: '1px solid var(--border-glass)', cursor: 'pointer' }} onClick={() => onSelectVendor(item)}>
              <td style={{ padding: '1.5rem' }}>
                <div style={{ fontWeight: 600 }}>{item.business_name || 'N/A'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {item.id.slice(0, 8)}</div>
                {item.business_details && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                    {item.business_details.phone && <div>📞 {item.business_details.phone}</div>}
                    {item.business_details.address && <div>📍 {item.business_details.address}</div>}
                  </div>
                )}
              </td>
              <td style={{ padding: '1.5rem' }}>
                {item.full_name}
                <br/>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.email}</span>
                {item.business_details?.description && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-muted)', maxWidth: '300px' }}>
                    "{item.business_details.description.length > 80 ? item.business_details.description.slice(0, 80) + '...' : item.business_details.description}"
                  </div>
                )}
              </td>
              {vendorFilter === 'preorder_pending' && (
                <td style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {item.store_video_url && <a href={item.store_video_url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#60a5fa', textDecoration: 'none', fontSize: '0.8rem' }}><Video size={14} /> Video</a>}
                    {item.store_image_url && <a href={item.store_image_url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#60a5fa', textDecoration: 'none', fontSize: '0.8rem' }}><Eye size={14} /> Image</a>}
                  </div>
                </td>
              )}
              <td style={{ padding: '1.5rem' }}>
                <StatusBadge status={item.vendor_status} />
                {item.preorder_status === 'pending' && <div style={{ fontSize: '0.7rem', color: '#eab308', marginTop: '0.3rem' }}>Preorder App Pending</div>}
              </td>
              <td style={{ padding: '1.5rem', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                {item.vendor_status === 'pending' ? (
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button onClick={() => onVendorAction(item.id, 'approved')} className="btn-gold" style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem' }}>APPROVE VENDOR</button>
                    <button onClick={() => onVendorAction(item.id, 'rejected')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem', background: '#333', border: 'none', color: 'white', borderRadius: '4px' }}>REJECT</button>
                  </div>
                ) : item.preorder_status === 'pending' ? (
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button onClick={() => onPreorderReview(item.id, 'approved')} className="btn-gold" style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem' }}>APPROVE PREORDER</button>
                    <button onClick={() => onPreorderReview(item.id, 'rejected')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem', background: '#333', border: 'none', color: 'white', borderRadius: '4px' }}>REJECT</button>
                  </div>
                ) : (
                  <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><MoreVertical size={18} /></button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
