import express from 'express';
import cors from 'cors';
import db from './db.js';
import { randomUUID } from 'crypto';

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
  res.json({ success: true });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
