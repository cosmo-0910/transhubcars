import { StatusBadge } from './StatusBadge';

export interface User {
  id: string;
  full_name: string;
  email: string;
  status?: string;
  created_at: string;
}

interface UserManagementTableProps {
  users: User[];
  onAction: (id: string, action: 'suspended' | 'banned' | 'active') => void;
}

export const UserManagementTable = ({ users, onAction }: UserManagementTableProps) => {
  return (
    <div className="glass" style={{ borderRadius: '1.5rem', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-glass)' }}>
            <th style={{ padding: '1.5rem', textAlign: 'left' }}>Name</th>
            <th style={{ padding: '1.5rem', textAlign: 'left' }}>Email</th>
            <th style={{ padding: '1.5rem', textAlign: 'left' }}>Status</th>
            <th style={{ padding: '1.5rem', textAlign: 'left' }}>Joined</th>
            <th style={{ padding: '1.5rem', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((item) => (
            <tr key={item.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
              <td style={{ padding: '1.5rem' }}>{item.full_name}</td>
              <td style={{ padding: '1.5rem' }}>{item.email}</td>
              <td style={{ padding: '1.5rem' }}><StatusBadge status={item.status || 'active'} /></td>
              <td style={{ padding: '1.5rem' }}>{new Date(item.created_at).toLocaleDateString()}</td>
              <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  {item.status !== 'suspended' && (
                    <button onClick={() => onAction(item.id, 'suspended')} style={{ color: '#eab308', background: 'rgba(234, 179, 8, 0.1)', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.7rem' }}>SUSPEND</button>
                  )}
                  {item.status !== 'banned' && (
                    <button onClick={() => onAction(item.id, 'banned')} style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.7rem' }}>BAN</button>
                  )}
                  {item.status !== 'active' && (
                    <button onClick={() => onAction(item.id, 'active')} style={{ color: '#4ade80', background: 'rgba(74, 222, 128, 0.1)', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.7rem' }}>ACTIVATE</button>
                  )}
                  </div>
                </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
