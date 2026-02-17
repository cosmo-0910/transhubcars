
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const loadEnv = () => {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        process.env[parts[0].trim()] = parts.slice(1).join('=').trim();
      }
    });
  }
};

loadEnv();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdmins() {
  // 1. Check columns
  const { data: sample } = await supabase.from('profiles').select('*').limit(1);
  if (sample && sample[0]) {
    console.log('Profile columns:', Object.keys(sample[0]));
  }

  // 2. Fetch admins
  const { data: allAdmins, error: adminError } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'admin');

  if (adminError) {
    console.error('Error fetching admins:', adminError);
  } else {
    console.log(`Total Admins: ${allAdmins.length}`);
    allAdmins.forEach(a => {
      console.log(`- ${a.full_name} (email: ${a.email}) [role: ${a.role}]`);
    });
  }

  // 3. Fetch recent profiles
  const { data: recent, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (recent) {
    console.log('\nRecent Profiles (any role):');
    recent.forEach(p => console.log(`- ${p.full_name} (${p.role}) created at ${p.created_at}`));
  }
}

checkAdmins();
