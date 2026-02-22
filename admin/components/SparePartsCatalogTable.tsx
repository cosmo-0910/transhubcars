import { db, type SparePart } from '../../shared/lib/db';
import { formatPrice } from '../../shared/lib/formatters';
import { Edit, Trash2, Package, Search, Plus } from 'lucide-react';
import { useState } from 'react';
import { useAlert } from '../../shared/context/AlertContext';

interface SparePartsCatalogTableProps {
  parts: SparePart[];
  onRefresh: () => void;
  onEdit: (part: SparePart) => void;
  onAdd: () => void;
}

export const SparePartsCatalogTable = ({ parts, onRefresh, onEdit, onAdd }: SparePartsCatalogTableProps) => {
  const { showAlert } = useAlert();
  const [searchQuery, setSearchQuery] = useState('');

  const handleDeletePart = async (id: string) => {
    showAlert({
      title: 'Remove Component',
      message: 'Are you sure you want to permanently remove this part from the global catalog?',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await db.deleteSparePart(id);
              onRefresh();
              showAlert({ title: 'Success', message: 'Part removed successfully.' });
            } catch (err) {
              showAlert({ title: 'Error', message: 'Failed to delete part.' });
            }
          }
        }
      ]
    });
  };

  const filteredParts = parts.filter(part => 
    `${part.name} ${part.vehicle_make} ${part.vehicle_model}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="glass" style={{ borderRadius: '1.5rem', overflow: 'hidden' }}>
      <div style={{ padding: '2rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search components, makes, or models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="luxury-input"
              style={{ paddingLeft: '3rem', width: '100%' }}
            />
          </div>
        </div>
        <button className="btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem' }} onClick={onAdd}>
          <Plus size={18} /> NEW COMPONENT
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.01)' }}>
              <th style={{ padding: '1.2rem 2rem', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '2px' }}>COMPONENT</th>
              <th style={{ padding: '1.2rem 2rem', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '2px' }}>COMPATIBILITY</th>
              <th style={{ padding: '1.2rem 2rem', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '2px' }}>PRICE</th>
              <th style={{ padding: '1.2rem 2rem', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '2px' }}>STOCK</th>
              <th style={{ padding: '1.2rem 2rem', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '2px' }}>STATUS</th>
              <th style={{ padding: '1.2rem 2rem', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '2px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredParts.map((part) => (
              <tr key={part.id} className="smooth-transition" style={{ borderBottom: '1px solid var(--border-glass)', background: 'transparent' }}>
                <td style={{ padding: '1.5rem 2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '0.8rem', background: 'black', overflow: 'hidden' }}>
                      <img src={part.image_url} alt={part.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{part.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{part.category}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1.5rem 2rem' }}>
                  <div style={{ fontWeight: 500 }}>{part.vehicle_make} {part.vehicle_model}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{part.vehicle_year}</div>
                </td>
                <td style={{ padding: '1.5rem 2rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                  {formatPrice(part.price)}
                </td>
                <td style={{ padding: '1.5rem 2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Package size={14} color="var(--text-muted)" />
                    {part.stock_quantity}
                  </div>
                </td>
                <td style={{ padding: '1.5rem 2rem' }}>
                  <span style={{ 
                    padding: '0.3rem 0.8rem', 
                    borderRadius: '1rem', 
                    fontSize: '0.7rem', 
                    fontWeight: 700, 
                    textTransform: 'uppercase',
                    background: part.status === 'active' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: part.status === 'active' ? '#4ade80' : '#ef4444',
                    border: `1px solid ${part.status === 'active' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                  }}>
                    {part.status}
                  </span>
                </td>
                <td style={{ padding: '1.5rem 2rem' }}>
                  <div style={{ display: 'flex', gap: '0.8rem' }}>
                    <button 
                      onClick={() => onEdit(part)}
                      className="smooth-transition"
                      style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '0.5rem', color: 'white', cursor: 'pointer' }}
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeletePart(part.id)}
                      className="smooth-transition"
                      style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.05)', border: 'none', borderRadius: '0.5rem', color: '#ef4444', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
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
