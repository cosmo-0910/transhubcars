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
      price: 250000000,
      status: 'Readily Available',
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
      make: 'Lexus',
      model: 'RX 350 Luxury',
      year: 2023,
      price: 85000000,
      status: 'Readily Available',
      description: 'The definitive Nigerian luxury crossover. Exceptional comfort, reliability, and resale value.',
      image_url: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2070&auto=format&fit=crop',
      gallery_urls: JSON.stringify([]),
      mileage: 5000,
      vin: '2T2HZMHA5PC001234',
      transmission: 'Automatic',
      fuel_type: 'Petrol',
      interior_color: 'Parchment',
      exterior_color: 'Eminent White Pearl',
      engine: '2.4L Turbo I4',
      stock_number: 'TH-2023-LX-RX'
    },
    {
      id: '3',
      make: 'Toyota',
      model: 'Camry XSE',
      year: 2022,
      price: 45000000,
      status: 'Readily Available',
      description: 'Sporty and sophisticated, the Camry remains a king on Nigerian roads. Low maintenance and high performance.',
      image_url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=2070&auto=format&fit=crop',
      gallery_urls: JSON.stringify([]),
      mileage: 12000,
      vin: '4T1B11AK5NU004567',
      transmission: 'Automatic',
      fuel_type: 'Petrol',
      interior_color: 'Black Leather',
      exterior_color: 'Celestial Silver',
      engine: '2.5L I4',
      stock_number: 'TH-2022-TY-CM'
    },
    {
      id: '4',
      make: 'Toyota',
      model: 'Land Cruiser 300',
      year: 2024,
      price: 195000000,
      status: 'Preorder',
      description: 'The King of all terrain. The Land Cruiser 300 series combines rugged capability with ultimate luxury.',
      image_url: 'https://images.unsplash.com/photo-1611859328053-3cbc9f9399f4?q=80&w=1965&auto=format&fit=crop',
      gallery_urls: JSON.stringify([]),
      mileage: 0,
      vin: 'JTMHU01J5P0009876',
      transmission: 'Automatic',
      fuel_type: 'Diesel',
      interior_color: 'Neutral Beige',
      exterior_color: 'Precious White',
      engine: '3.3L V6 Twin-Turbo Diesel',
      stock_number: 'TH-2024-TY-LC300'
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
