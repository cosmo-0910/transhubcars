
import { supabase } from './shared/lib/supabase.js';

async function checkAuditLogs() {
  console.log('Checking audit_logs table...');
  const { data, error, count } = await supabase
    .from('audit_logs')
    .select('*', { count: 'exact' });

  if (error) {
    console.error('Error fetching audit_logs:', error);
  } else {
    console.log(`Found ${count} audit logs.`);
    console.log('Last 5 logs:', data.slice(-5));
  }

  console.log('Checking profiles table for admin role...');
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, role')
    .eq('role', 'admin');

  if (profileError) {
    console.error('Error fetching profiles:', profileError);
  } else {
    console.log(`Found ${profiles.length} admins.`);
    console.log('Admins:', profiles);
  }
}

checkAuditLogs();
