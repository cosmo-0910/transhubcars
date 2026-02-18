import { useState, useEffect } from 'react';
import { supabase } from '../../shared/lib/db';
import { 
  Truck, MapPin, Navigation, 
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';

export const TowingManagement = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'Searching' | 'En Route' | 'Completed'>('all');

  useEffect(() => {
    fetchData();

    // Subscribe to all changes in tow_requests
    const requestSub = supabase
      .channel('admin_tow_requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tow_requests' }, () => {
        fetchData();
      })
      .subscribe();

    // Subscribe to driver location/status updates
    const driverSub = supabase
      .channel('admin_tow_drivers')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'profiles',
        filter: 'role=eq.vendor'
      }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      requestSub.unsubscribe();
      driverSub.unsubscribe();
    };
  }, []);

  const fetchData = async () => {
    try {
      const [reqRes, driverRes] = await Promise.all([
        supabase
          .from('tow_requests')
          .select('*, profiles!user_id(full_name)')
          .order('created_at', { ascending: false }),
        supabase
          .from('profiles')
          .select('*')
          .eq('role', 'vendor')
          .eq('vendor_type', 'tow_truck')
      ]);

      if (reqRes.data) setRequests(reqRes.data);
      if (driverRes.data) setDrivers(driverRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Searching': return { bg: 'rgba(234, 179, 8, 0.1)', text: '#eab308' };
      case 'En Route': 
      case 'At Pickup':
      case 'In Transit': return { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6' };
      case 'Completed': return { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e' };
      case 'Cancelled': return { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' };
      default: return { bg: 'rgba(255, 255, 255, 0.1)', text: 'var(--text-muted)' };
    }
  };

  const filteredRequests = requests.filter(r => 
    filter === 'all' ? true : r.status === filter
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="luxury-font" style={{ fontSize: '2rem', margin: 0 }}>Towing Command.</h2>
          <p style={{ color: 'var(--text-muted)' }}>Fleet Operations & Real-time Recovery Oversight</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '0.4rem', borderRadius: '1rem', border: '1px solid var(--border-glass)' }}>
          {['all', 'Searching', 'En Route', 'Completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.6rem',
                border: 'none',
                background: filter === f ? 'var(--accent-gold)' : 'transparent',
                color: filter === f ? 'black' : 'var(--text-muted)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'uppercase',
                transition: 'all 0.2s'
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Active Requests List */}
        <div className="glass" style={{ borderRadius: '1.5rem', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Active Fleet Recovery Requests</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{filteredRequests.length} Total Requests</span>
          </div>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {filteredRequests.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-deep)', zIndex: 5 }}>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-glass)' }}>
                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>CLIENT</th>
                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>LOCATION</th>
                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>STATUS</th>
                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>DRIVER</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map(req => {
                    const statusStyle = getStatusColor(req.status);
                    const driver = drivers.find(d => d.id === req.driver_id);
                    return (
                      <motion.tr 
                        key={req.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ borderBottom: '1px solid var(--border-glass)' }}
                      >
                        <td style={{ padding: '1.2rem 1.5rem' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{req.profiles?.full_name || 'Anonymous User'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{req.vehicle_type}</div>
                        </td>
                        <td style={{ padding: '1.2rem 1.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                            <MapPin size={14} color="var(--accent-gold)" />
                            <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {req.pickup_address}
                            </span>
                          </div>
                          {req.destination_address && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                              <Navigation size={12} /> {req.destination_address}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '1.2rem 1.5rem' }}>
                          <span style={{ 
                            padding: '0.3rem 0.8rem', 
                            borderRadius: '2rem', 
                            fontSize: '0.7rem', 
                            background: statusStyle.bg, 
                            color: statusStyle.text, 
                            fontWeight: 700,
                            textTransform: 'uppercase'
                          }}>
                            {req.status}
                          </span>
                        </td>
                        <td style={{ padding: '1.2rem 1.5rem' }}>
                          {driver ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Truck size={14} color="var(--accent-gold)" />
                              </div>
                              <span style={{ fontSize: '0.85rem' }}>{driver.full_name}</span>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Unassigned</span>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No recovery requests found matching the current filter.
              </div>
            )}
          </div>
        </div>

        {/* Online Drivers & Fleet Health */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass" style={{ padding: '1.5rem', borderRadius: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Activity size={18} color="var(--accent-gold)" /> Fleet Status
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {drivers.length > 0 ? drivers.map(driver => (
                <div key={driver.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem', border: '1px solid var(--border-glass)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{driver.full_name}</div>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: driver.is_online ? '#4ade80' : '#ef4444', boxShadow: driver.is_online ? '0 0 8px rgba(74,222,128,0.5)' : 'none' }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Truck size={12} /> {driver.is_online ? 'Online & Available' : 'Offline'}
                  </div>
                  {driver.is_online && (
                    <div style={{ marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                       <button className="text-btn" style={{ fontSize: '0.7rem', color: 'var(--accent-gold)' }}>LIVE TRACK</button>
                       <button className="text-btn" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>FLEET CHAT</button>
                    </div>
                  )}
                </div>
              )) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  No tow drivers found in the system.
                </div>
              )}
            </div>
          </div>

          <div className="glass" style={{ padding: '1.5rem', borderRadius: '1.5rem', background: 'linear-gradient(135deg, rgba(197, 164, 89, 0.05) 0%, transparent 100%)' }}>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>Quick Metrics</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{requests.filter(r => r.status === 'Searching').length}</div>
                <div style={{ fontSize: '0.65rem', color: '#eab308', fontWeight: 600 }}>SEARCHING</div>
              </div>
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{drivers.filter(d => d.is_online).length}</div>
                <div style={{ fontSize: '0.65rem', color: '#4ade80', fontWeight: 600 }}>ONLINE</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
