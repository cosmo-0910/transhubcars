import express from 'express';
import cors from 'cors';
import db from './db.ts';
import { randomUUID } from 'crypto';
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

// --- CARS ---
app.get('/api/cars', (req, res) => {
  const cars = db.prepare('SELECT * FROM cars ORDER BY created_at DESC').all() as any[];
  const parsedCars = cars.map(car => ({
    ...car,
    gallery_urls: JSON.parse(car.gallery_urls || '[]')
  }));
  res.json(parsedCars);
});

app.post('/api/cars', (req, res) => {
  const { 
    make, model, year, price, status, description, image_url, gallery_urls,
    mileage, vin, transmission, fuel_type, interior_color, exterior_color, engine, stock_number
  } = req.body;
  const id = randomUUID();
  db.prepare(`
    INSERT INTO cars (
      id, make, model, year, price, status, description, image_url, gallery_urls,
      mileage, vin, transmission, fuel_type, interior_color, exterior_color, engine, stock_number
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, make, model, year, price, status, description, image_url, JSON.stringify(gallery_urls || []),
    mileage, vin, transmission, fuel_type, interior_color, exterior_color, engine, stock_number
  );
  res.json({ id });
});

app.put('/api/cars/:id', (req, res) => {
  const { 
    make, model, year, price, status, description, image_url, gallery_urls,
    mileage, vin, transmission, fuel_type, interior_color, exterior_color, engine, stock_number
  } = req.body;
  db.prepare(`
    UPDATE cars SET 
      make = ?, model = ?, year = ?, price = ?, status = ?, description = ?, image_url = ?, gallery_urls = ?,
      mileage = ?, vin = ?, transmission = ?, fuel_type = ?, interior_color = ?, exterior_color = ?, engine = ?, stock_number = ?
    WHERE id = ?
  `).run(
    make, model, year, price, status, description, image_url, JSON.stringify(gallery_urls || []),
    mileage, vin, transmission, fuel_type, interior_color, exterior_color, engine, stock_number,
    req.params.id
  );
  res.json({ success: true });
});

app.delete('/api/cars/:id', (req, res) => {
  db.prepare('DELETE FROM cars WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// --- INQUIRIES ---
app.get('/api/inquiries', (req, res) => {
  const inquiries = db.prepare('SELECT * FROM inquiries ORDER BY created_at DESC').all();
  res.json(inquiries);
});

app.post('/api/inquiries', (req, res) => {
  const { name, email, phone, type, message, carId, carName } = req.body;
  const id = randomUUID();
  db.prepare('INSERT INTO inquiries (id, name, email, phone, type, message, car_id, car_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, name, email, phone, type, message, carId, carName);
  res.json({ id });
});

app.put('/api/inquiries/:id/status', (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE inquiries SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ success: true });
});

// --- PREORDERS ---
app.get('/api/preorders', (req, res) => {
  const preorders = db.prepare('SELECT * FROM preorders ORDER BY created_at DESC').all();
  res.json(preorders);
});

app.post('/api/preorders', (req, res) => {
  const { name, email, phone, make, model, year, budget, message } = req.body;
  const id = randomUUID();
  db.prepare('INSERT INTO preorders (id, name, email, phone, make, model, year, budget, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, name, email, phone, make, model, year, budget, message);
  res.json({ id });
});

app.put('/api/preorders/:id/status', (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE preorders SET status = ? WHERE id = ?').run(status, req.params.id);
  db.prepare('UPDATE preorders SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ success: true });
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

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
