import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
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

const resendApiKey = process.env.RESEND_API_KEY;
let resend: Resend | null = null;

if (resendApiKey && resendApiKey !== 're_your_api_key_here') {
  resend = new Resend(resendApiKey);
} else {
  console.warn('RESEND_API_KEY missing or placeholder in .env file. Email sending will be disabled.');
}

const app = express();
app.use(cors());
app.use(express.json());

// --- OAUTH PROXY ROUTE ---
app.get('/api/auth/google', async (req, res) => {
  if (!supabaseUrl) {
    res.status(500).json({ error: 'Supabase URL misconfigured' });
    return;
  }
  const redirectTo = (req.query.redirectTo as string) || 'https://www.transhub.ng/auth/callback';
  const supabaseOAuthUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}`;
  res.redirect(supabaseOAuthUrl);
});

// --- EMAIL NOTIFICATIONS ---
app.post('/api/notifications/send-email', async (req, res) => {
  const { to, subject, html, text, from } = req.body;

  if (!resend) {
    res.status(500).json({ error: 'Resend API key is not configured on the server.' });
    return;
  }

  if (!to || !subject || (!html && !text)) {
    res.status(400).json({ error: 'Missing required parameters: to, subject, and html/text content are required.' });
    return;
  }

  try {
    const sender = from || 'TranshubNG <noreply@transhub.ng>';
    const { data, error } = await resend.emails.send({
      from: sender,
      to: Array.isArray(to) ? to : [to],
      subject: subject,
      html: html,
      text: text,
    });

    if (error) {
      console.error('[Resend Error]:', error);
      res.status(400).json({ error: error.message });
      return;
    }

    console.log(`[Email Sent] Message ID: ${data?.id} to ${to}`);
    res.json({ success: true, messageId: data?.id });
  } catch (error: any) {
    console.error('[Email Exception]:', error.message);
    res.status(500).json({ error: error.message });
  }
});

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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

