import { db } from '../shared/lib/db';
import type { Car, Inquiry, Preorder, Order } from '../shared/lib/db';
import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Edit, TrendingUp, Users, ShoppingBag, Search, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'leads' | 'preorders' | 'orders'>('inventory');
  const [cars, setCars] = useState<Car[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [preorders, setPreorders] = useState<Preorder[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [carsData, inquiriesData, preordersData, ordersData] = await Promise.all([
        db.getCars(),
        db.getInquiries(),
        db.getPreorders(),
        db.getOrders()
      ]);
      setCars(carsData);
      setInquiries(inquiriesData);
      setPreorders(preordersData);
      setOrders(ordersData);
    } catch (err) {
      console.error('Failed to load portal data:', err);
    }
  };

  const handleDeleteCar = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this vehicle from inventory?')) {
      await db.deleteCar(id);
      loadAllData();
    }
  };

  const handleSubmitCar = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const carData: Omit<Car, 'id'> = {
      make: formData.get('make') as string,
      model: formData.get('model') as string,
      year: parseInt(formData.get('year') as string),
      price: parseFloat(formData.get('price') as string),
      status: formData.get('status') as 'Ready to Ship' | 'Preorder',
      description: formData.get('description') as string,
      image_url: formData.get('image_url') as string || 'https://images.unsplash.com/photo-1542362567-b055034b4c1d?q=80&w=2070&auto=format&fit=crop',
      gallery_urls: (formData.get('gallery_urls') as string).split('\n').filter(url => url.trim() !== ''),
      mileage: parseInt(formData.get('mileage') as string) || 0,
      vin: formData.get('vin') as string,
      transmission: formData.get('transmission') as any,
      fuel_type: formData.get('fuel_type') as any,
      interior_color: formData.get('interior_color') as string,
      exterior_color: formData.get('exterior_color') as string,
      engine: formData.get('engine') as string,
      stock_number: formData.get('stock_number') as string,
    };

    if (editingCar) {
      await db.updateCar(editingCar.id, carData);
    } else {
      await db.saveCar(carData);
    }
    
    loadAllData();
    setShowAddForm(false);
    setEditingCar(null);
  };

  const stats = useMemo(() => ({
    portfolioValue: cars.reduce((acc, car) => acc + car.price, 0),
    totalLeads: inquiries.length,
    activeOrders: orders.filter(o => o.status !== 'Delivered').length,
    salesVolume: orders.reduce((acc, o) => acc + o.amount, 0)
  }), [cars, inquiries, orders]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (activeTab === 'inventory') return cars.filter(c => `${c.make} ${c.model}`.toLowerCase().includes(q));
    if (activeTab === 'leads') return inquiries.filter(i => i.name.toLowerCase().includes(q) || i.email.toLowerCase().includes(q));
    if (activeTab === 'preorders') return preorders.filter(p => p.name.toLowerCase().includes(q) || p.make.toLowerCase().includes(q));
    if (activeTab === 'orders') return orders.filter(o => o.payment_ref?.toLowerCase().includes(q) || o.id.includes(q));
    return [];
  }, [activeTab, cars, inquiries, preorders, orders, searchQuery]);

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 className="luxury-font" style={{ fontSize: '2.5rem' }}>Management Console.</h1>
          <div className="glass" style={{ padding: '0.4rem', borderRadius: '1rem', display: 'flex', gap: '0.3rem' }}>
            {(['inventory', 'leads', 'preorders', 'orders'] as const).map(tab => (
              <button 
                key={tab}
                onClick={() => { setActiveTab(tab); setSearchQuery(''); }}
                className="smooth-transition"
                style={{ 
                  background: activeTab === tab ? 'var(--accent-gold)' : 'transparent',
                  color: activeTab === tab ? 'black' : 'white',
                  border: 'none',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '0.7rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.8rem'
                }}
              >{tab.toUpperCase()}</button>
            ))}
          </div>
        </div>

        {/* KPI Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <KpiCard title="INVENTORY VALUE" value={`$${stats.portfolioValue.toLocaleString()}`} icon={<TrendingUp size={20} color="var(--accent-gold)" />} color="var(--accent-gold)" />
          <KpiCard title="TOTAL LEADS" value={stats.totalLeads} icon={<Users size={20} color="#4ade80" />} color="#4ade80" />
          <KpiCard title="ACTIVE ORDERS" value={stats.activeOrders} icon={<ShoppingBag size={20} color="#60a5fa" />} color="#60a5fa" />
          <KpiCard title="SALES VOLUME" value={`$${stats.salesVolume.toLocaleString()}`} icon={<DollarSign size={20} color="#a78bfa" />} color="#a78bfa" />
        </div>
      </header>

      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder={`Search ${activeTab}...`} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', padding: '0.8rem 1rem 0.8rem 3rem', borderRadius: '0.5rem', color: 'white', outline: 'none' }}
          />
        </div>
        {activeTab === 'inventory' && (
          <button className="btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }} onClick={() => setShowAddForm(true)}>
            <Plus size={18} /> ADD VEHICLE
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'inventory' && (
             <section>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-glass)', textAlign: 'left' }}>
                      <th style={{ padding: '1.2rem' }}>VEHICLE</th>
                      <th style={{ padding: '1.2rem' }}>YEAR</th>
                      <th style={{ padding: '1.2rem' }}>STATUS</th>
                      <th style={{ padding: '1.2rem' }}>PRICE</th>
                      <th style={{ padding: '1.2rem', textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((car: any) => (
                      <tr key={car.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                        <td style={{ padding: '1.2rem' }}>{car.make} {car.model}</td>
                        <td style={{ padding: '1.2rem' }}>{car.year}</td>
                        <td style={{ padding: '1.2rem' }}><span style={{ fontSize: '0.7rem', color: 'var(--accent-gold)' }}>{car.status}</span></td>
                        <td style={{ padding: '1.2rem' }}>${car.price.toLocaleString()}</td>
                        <td style={{ padding: '1.2rem', textAlign: 'right' }}>
                          <button onClick={() => { setEditingCar(car); setShowAddForm(true); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginRight: '1rem' }}><Edit size={18}/></button>
                          <button onClick={() => handleDeleteCar(car.id)} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer' }}><Trash2 size={18}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === 'leads' && (
             <section>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredItems.map((lead: any) => (
                  <div key={lead.id} className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{lead.name} • <span style={{ color: 'var(--text-muted)' }}>{lead.email}</span></h4>
                      <p style={{ fontSize: '0.9rem' }}>Interest: <strong style={{ color: 'var(--accent-gold)' }}>{lead.type}</strong> for {lead.carName}</p>
                      {lead.message && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>"{lead.message}"</p>}
                    </div>
                    <select value={lead.status} onChange={(e) => db.updateInquiryStatus(lead.id, e.target.value as any).then(loadAllData)} className="admin-input" style={{ width: 'auto', padding: '0.3rem 1rem' }}>
                      <option value="New">NEW</option>
                      <option value="Contacted">CONTACTED</option>
                      <option value="Archived">ARCHIVED</option>
                    </select>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'preorders' && (
             <section>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredItems.map((p: any) => (
                  <div key={p.id} className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{p.name} • {p.make} {p.model}</h4>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Budget: ${p.budget?.toLocaleString() || 'N/A'}</p>
                    </div>
                    <select value={p.status} onChange={(e) => db.updatePreorderStatus(p.id, e.target.value as any).then(loadAllData)} className="admin-input" style={{ width: 'auto', padding: '0.3rem 1rem' }}>
                      <option value="Searching">SEARCHING</option>
                      <option value="Sourced">SOURCED</option>
                      <option value="Delivered">DELIVERED</option>
                    </select>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'orders' && (
             <section>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-glass)', textAlign: 'left' }}>
                      <th style={{ padding: '1.2rem' }}>ORDER REF</th>
                      <th style={{ padding: '1.2rem' }}>VEHICLE</th>
                      <th style={{ padding: '1.2rem' }}>AMOUNT</th>
                      <th style={{ padding: '1.2rem' }}>STATUS</th>
                      <th style={{ padding: '1.2rem', textAlign: 'right' }}>MANAGEMENT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((o: any) => (
                      <tr key={o.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                        <td style={{ padding: '1.2rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{o.payment_ref || o.id.slice(0, 8)}</td>
                        <td style={{ padding: '1.2rem' }}>{o.cars?.make} {o.cars?.model}</td>
                        <td style={{ padding: '1.2rem' }}>${o.amount.toLocaleString()}</td>
                        <td style={{ padding: '1.2rem' }}>
                           <span style={{ 
                             padding: '0.3rem 0.8rem', 
                             borderRadius: '2rem', 
                             fontSize: '0.7rem', 
                             background: o.status === 'Paid' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                             color: o.status === 'Paid' ? '#4ade80' : 'white'
                           }}>{o.status.toUpperCase()}</span>
                        </td>
                        <td style={{ padding: '1.2rem', textAlign: 'right' }}>
                          <select 
                            value={o.status} 
                            onChange={(e) => db.updateOrderStatus(o.id, e.target.value as any).then(loadAllData)} 
                            className="admin-input" 
                            style={{ width: 'auto', padding: '0.3rem 0.6rem' }}
                          >
                            <option value="Pending">PENDING</option>
                            <option value="Paid">PAID</option>
                            <option value="Processing">PROCESSING</option>
                            <option value="Shipped">SHIPPED</option>
                            <option value="Delivered">DELIVERED</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Add/Edit Form Overlay */}
      <AnimatePresence>
        {showAddForm && (
           <div style={{ position: 'fixed', inset: 0, zIndex: 4000, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass" style={{ width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', padding: '3rem', borderRadius: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                  <h2 className="luxury-font">{editingCar ? 'EDIT VEHICLE' : 'ADD NEW VEHICLE'}</h2>
                  <button onClick={() => setShowAddForm(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>✕</button>
                </div>
                <form onSubmit={handleSubmitCar} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  {/* ... reusing inputs from previous version but making it clean ... */}
                  <div>
                    <label className="luxury-label">Make</label>
                    <input name="make" defaultValue={editingCar?.make} required className="admin-input" />
                  </div>
                  <div>
                    <label className="luxury-label">Model</label>
                    <input name="model" defaultValue={editingCar?.model} required className="admin-input" />
                  </div>
                  <div>
                    <label className="luxury-label">Year</label>
                    <input name="year" type="number" defaultValue={editingCar?.year} required className="admin-input" />
                  </div>
                  <div>
                    <label className="luxury-label">Price</label>
                    <input name="price" type="number" defaultValue={editingCar?.price} required className="admin-input" />
                  </div>
                  <div>
                    <label className="luxury-label">Status</label>
                    <select name="status" defaultValue={editingCar?.status} className="admin-input">
                      <option value="Ready to Ship">Ready to Ship</option>
                      <option value="Preorder">Preorder</option>
                    </select>
                  </div>
                  <div>
                    <label className="luxury-label">Stock Number</label>
                    <input name="stock_number" defaultValue={editingCar?.stock_number} className="admin-input" />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="luxury-label">Description</label>
                    <textarea name="description" defaultValue={editingCar?.description} className="admin-input" rows={3} style={{ resize: 'none' }} />
                  </div>
                  {/* Additional Specs */}
                   <div>
                    <label className="luxury-label">Mileage</label>
                    <input name="mileage" type="number" defaultValue={editingCar?.mileage} className="admin-input" />
                  </div>
                  <div>
                    <label className="luxury-label">VIN</label>
                    <input name="vin" defaultValue={editingCar?.vin} className="admin-input" />
                  </div>
                  <div>
                    <label className="luxury-label">Transmission</label>
                    <input name="transmission" defaultValue={editingCar?.transmission} className="admin-input" />
                  </div>
                  <div>
                    <label className="luxury-label">Fuel Type</label>
                    <input name="fuel_type" defaultValue={editingCar?.fuel_type} className="admin-input" />
                  </div>
                  <div>
                    <label className="luxury-label">Interior Color</label>
                    <input name="interior_color" defaultValue={editingCar?.interior_color} className="admin-input" />
                  </div>
                  <div>
                    <label className="luxury-label">Exterior Color</label>
                    <input name="exterior_color" defaultValue={editingCar?.exterior_color} className="admin-input" />
                  </div>
                   <div>
                    <label className="luxury-label">Engine</label>
                    <input name="engine" defaultValue={editingCar?.engine} className="admin-input" />
                  </div>
                   <div>
                    <label className="luxury-label">Main Image URL</label>
                    <input name="image_url" defaultValue={editingCar?.image_url} className="admin-input" />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="luxury-label">Gallery URLs (one per line)</label>
                    <textarea name="gallery_urls" defaultValue={editingCar?.gallery_urls?.join('\n')} className="admin-input" rows={3} style={{ resize: 'none' }} />
                  </div>
                  <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <button type="submit" className="btn-gold" style={{ flex: 1 }}>SAVE CHANGES</button>
                    <button type="button" onClick={() => setShowAddForm(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white' }}>CANCEL</button>
                  </div>
                </form>
             </motion.div>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const KpiCard = ({ title, value, icon, color }: { title: string, value: any, icon: any, color: string }) => (
  <div className="glass" style={{ padding: '1.5rem', borderRadius: '1.2rem', borderLeft: `4px solid ${color}` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '1px' }}>{title}</span>
      {icon}
    </div>
    <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{value}</div>
  </div>
);
