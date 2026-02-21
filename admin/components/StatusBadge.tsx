
export const StatusBadge = ({ status }: { status: string, type?: 'success' | 'warning' | 'danger' | 'default' }) => {
  const colors = {
    success: { bg: 'rgba(74, 222, 128, 0.1)', text: '#4ade80' },
    warning: { bg: 'rgba(234, 179, 8, 0.1)', text: '#eab308' },
    danger: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' },
    default: { bg: 'rgba(255, 255, 255, 0.1)', text: 'var(--text-muted)' }
  };
  
  let color = colors.default;
  const safeStatus = (status || '').toLowerCase();
  
  if (['approved', 'paid', 'delivered', 'operational', 'active'].includes(safeStatus)) color = colors.success;
  if (['pending', 'processing', 'searching', 'degraded'].includes(safeStatus)) color = colors.warning;
  if (['rejected', 'down', 'archived', 'none'].includes(safeStatus)) color = colors.danger;

  return (
    <span style={{ 
      padding: '0.25rem 0.75rem', 
      borderRadius: '2rem', 
      fontSize: '0.7rem', 
      background: color.bg, 
      color: color.text, 
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    }}>
      {status}
    </span>
  );
};
