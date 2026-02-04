import Database from 'better-sqlite3';
import { resolve } from 'path';

const dbPath = resolve(process.cwd(), 'transhub.db');
const db = new Database(dbPath);

// Initialize Schema and Seed Data
db.exec(`
  CREATE TABLE IF NOT EXISTS cars (
    id TEXT PRIMARY KEY,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    price REAL NOT NULL,
    status TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    gallery_urls TEXT, -- JSON array of strings
    mileage INTEGER DEFAULT 0,
    vin TEXT,
    transmission TEXT,
    fuel_type TEXT,
    interior_color TEXT,
    exterior_color TEXT,
    engine TEXT,
    stock_number TEXT,
    vendor_id TEXT,
    approval_status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed Cars if empty
const carCount = db.prepare('SELECT COUNT(*) as count FROM cars').get() as { count: number };
if (carCount.count === 0) {
  const initialCars = [
    {
      id: '1',
      make: 'Mercedes-Benz',
      model: 'G-Wagon G63',
      year: 2024,
      price: 250000,
      status: 'Ready to Ship',
      description: 'The pinnacle of luxury SUVs, finished in obsidian black with cranberry leather interior.',
      image_url: 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?q=80&w=2070&auto=format&fit=crop',
      gallery_urls: JSON.stringify([
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1541443131876-44b03de101c5?q=80&w=2070&auto=format&fit=crop'
      ]),
      mileage: 45,
      vin: 'WDCYC7CH5RX001923',
      transmission: 'Automatic',
      fuel_type: 'Petrol',
      interior_color: 'Cranberry Red',
      exterior_color: 'Obsidian Black',
      engine: '4.0L V8 Biturbo',
      stock_number: 'TH-2024-G63'
    },
    {
      id: '2',
      make: 'Range Rover',
      model: 'Autobiography',
      year: 2024,
      price: 180000,
      status: 'Preorder',
      description: 'Refining luxury through reductive design. Bespoke sourcing available for your specifications.',
      image_url: 'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?q=80&w=1965&auto=format&fit=crop',
      gallery_urls: JSON.stringify([]),
      mileage: 0,
      vin: 'SALYP2EU5PA001827',
      transmission: 'Automatic',
      fuel_type: 'Hybrid',
      interior_color: 'Deep Garnet',
      exterior_color: 'Belgravia Green',
      engine: '3.0L i6 MHEV',
      stock_number: 'TH-2024-RR-AB'
    }
  ];

  const insert = db.prepare(`
    INSERT INTO cars (
      id, make, model, year, price, status, description, image_url, gallery_urls, 
      mileage, vin, transmission, fuel_type, interior_color, exterior_color, engine, stock_number
    ) VALUES (
      @id, @make, @model, @year, @price, @status, @description, @image_url, @gallery_urls,
      @mileage, @vin, @transmission, @fuel_type, @interior_color, @exterior_color, @engine, @stock_number
    )
  `);
  for (const car of initialCars) {
    insert.run(car);
  }
}

db.exec(`
  CREATE TABLE IF NOT EXISTS inquiries (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    type TEXT NOT NULL,
    message TEXT,
    car_id TEXT,
    car_name TEXT,
    status TEXT DEFAULT 'New',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS preorders (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    make TEXT NOT NULL,
    model TEXT,
    year INTEGER,
    budget REAL,
    message TEXT,
    status TEXT DEFAULT 'Searching',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

export default db;
