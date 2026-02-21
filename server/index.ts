import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load env vars manually since dotenv is not in package.json
// This is a simple parser to ensure we get the keys
const loadEnv = () => {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envConfig = fs.readFileSync(envPath, 'utf8');
      envConfig.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const value = parts.slice(1).join('=').trim();
          if (key && value) {
            process.env[key] = value;
          }
        }
      });
    }
  } catch (e) {
    console.error('Failed to load .env file', e);
  }
};
loadEnv();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase credentials missing in server environment. Admin creation will fail.');
}

let supabaseAdmin: any = null;

if (supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
} else {
  console.warn('Supabase credentials missing in server environment. Admin creation will fail.');
}

const app = express();
app.use(cors());
app.use(express.json());

// --- ADMIN MANAGEMENT ---
app.post('/api/admin/create', async (req, res) => {
  const { email, password, fullName, permissions } = req.body;
  console.log(`[Admin Creation] Attempting to create admin: ${email} (${fullName})`);

  if (!supabaseAdmin) {
    console.error('[Admin Creation] Server misconfigured: Missing Service Role Key');
    res.status(500).json({ error: 'Server misconfigured: Missing Service Role Key in .env file' });
    return;
  }

  try {
    // 1. Create User in Supabase Auth
    const { data: user, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        is_admin: true,
        permissions: permissions || []
      }
    });

    if (authError) {
      console.error('[Admin Creation] Auth Error:', authError.message);
      throw authError;
    }

    console.log(`[Admin Creation] Successfully created user in Auth: ${user.user.id}`);
    
    res.json({ success: true, user });
  } catch (error: any) {
    console.error('[Admin Creation] Exception:', error.message);
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/admin/update', async (req, res) => {
  const { id, fullName, permissions } = req.body;
  console.log(`[Admin Update] Attempting to update admin: ${id} (${fullName})`);

  if (!supabaseAdmin) {
    console.error('[Admin Update] Server misconfigured: Missing Service Role Key');
    res.status(500).json({ error: 'Server misconfigured: Missing Service Role Key' });
    return;
  }

  try {
    const { data: user, error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, {
      user_metadata: {
        full_name: fullName,
        is_admin: true,
        permissions: permissions || []
      }
    });

    if (authError) {
      console.error('[Admin Update] Auth Error:', authError.message);
      throw authError;
    }

    console.log(`[Admin Update] Successfully updated user in Auth: ${id}`);

    // Redundant safety: Directly update profiles table to ensure immediate consistency
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name: fullName,
        permissions: permissions || []
      })
      .eq('id', id);

    if (profileError) {
      console.warn('[Admin Update] Profile sync warning:', profileError.message);
    }

    res.json({ success: true, user });
  } catch (error: any) {
    console.error('[Admin Update] Exception:', error.message);
    res.status(400).json({ error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
