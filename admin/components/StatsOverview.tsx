import { 
  Users, ShoppingBag, Activity, TrendingUp, DollarSign,
  Server, Zap
} from 'lucide-react';
import { formatPrice } from '../../shared/lib/formatters';

export interface KpiData {
  totalUsers: number;
  totalVendors: number;
  totalRevenue: number;
  activeOrders: number;
  systemStatus: 'Operational' | 'Degraded' | 'Down';
  pendingVendors: number;
  pendingListings: number;
  pendingInquiries: number;
  pendingPreorders: number;
  pendingParts: number;
  pendingTowing: number;
  volumeByBodyType: { name: string; value: number }[];
  topRegions: [string, number][];
}

const KpiCard = ({ title, value, subtext, icon: Icon, trend }: any) => (
  <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={20} color="var(--accent-gold)" />
      </div>
      {trend && (
        <span style={{ fontSize: '0.75rem', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '0.2rem', background: 'rgba(74, 222, 128, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '1rem' }}>
          <TrendingUp size={12} /> {trend}
        </span>
      )}
    </div>
    <div style={{ marginTop: '0.5rem' }}>
      <div style={{ fontSize: '1.8rem', fontWeight: 700, lineHeight: 1.2 }}>{value}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '0.2rem' }}>{title}</div>
    </div>
    {subtext && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{subtext}</div>}
  </div>
);

interface StatsOverviewProps {
  stats: KpiData;
  orders: any[]; // Ideally type this properly with Order
  hasPermission: (perm: string) => boolean;
}

export const StatsOverview = ({ stats, orders, hasPermission }: StatsOverviewProps) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
         <div>
           <h2 className="luxury-font" style={{ fontSize: '2.5rem', margin: 0 }}>Imperial Overview.</h2>
           <p style={{ color: 'var(--text-muted)' }}>Strategic Command Center</p>
         </div>
       </div>

       {/* Stats Grid */}
       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
         {hasPermission('users') && <KpiCard title="TOTAL USERS" value={stats.totalUsers} icon={Users} trend="12% MTD" />}
         {hasPermission('finance') && <KpiCard title="TOTAL REVENUE" value={formatPrice(stats.totalRevenue)} icon={DollarSign} trend="8% MTD" />}
         {hasPermission('orders') && <KpiCard title="ACTIVE ORDERS" value={stats.activeOrders} icon={ShoppingBag} subtext="Processing or Shipped" />}
         <KpiCard title="SYSTEM STATUS" value={stats.systemStatus} icon={Activity} subtext="All systems operational" />
       </div>

       {/* Additional Widgets */}
       <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
         <div className="glass" style={{ padding: '2rem', borderRadius: '1.5rem', minHeight: '300px' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
             <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Revenue Velocity</h3>
             <div className="text-muted" style={{ fontSize: '0.8rem' }}>Last 30 Days</div>
           </div>
           <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border-glass)', borderRadius: '1rem', color: 'var(--text-muted)', flexDirection: 'column', gap: '1rem' }}>
             <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
               {formatPrice(orders.reduce((acc, o) => acc + Number(o.amount), 0))}
             </div>
             <div style={{ fontSize: '0.9rem' }}>Total Processed Volume</div>
           </div>
         </div>
         <div className="glass" style={{ padding: '2rem', borderRadius: '1.5rem' }}>
           <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem' }}>System Health</h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             {['API Gateway', 'Database Cluster', 'CDN Edge', 'Auth Services'].map(service => (
               <div key={service} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.8rem' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                   <Server size={16} color="var(--text-muted)" />
                   <span style={{ fontSize: '0.9rem' }}>{service}</span>
                 </div>
                 <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 10px rgba(74,222,128,0.5)' }} />
               </div>
             ))}
           </div>
         </div>
       </div>
       
       <div className="glass" style={{ padding: '2rem', borderRadius: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={20} color="var(--accent-gold)" /> AI Strategic Intelligence
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>TOP SELLING CATEGORY</h4>
              <p style={{ fontSize: '1.1rem' }}>
                {stats.volumeByBodyType[0]?.name || 'N/A'} accounting for <strong>{stats.volumeByBodyType[0]?.value.toFixed(1) || 0}%</strong> of volume.
              </p>
            </div>
            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>HIGHEST VALUE ORDER</h4>
              <p style={{ fontSize: '1.1rem' }}>
                {orders.length > 0 
                  ? formatPrice(Math.max(...orders.map(o => o.amount))) 
                  : 'N/A'}
              </p>
            </div>
          </div>
       </div>
    </div>
  );
};
