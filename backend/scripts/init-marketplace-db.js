// backend/scripts/init-marketplace-db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path - corrected path
const dbPath = path.join(__dirname, '..', 'data', 'marketplace.db');

// Create connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite marketplace database.');
  }
});

// Initialize tables (same as before)
db.serialize(() => {
  // Products table
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    farmer_id INTEGER,
    name TEXT NOT NULL,
    category TEXT,
    price REAL NOT NULL,
    quantity REAL NOT NULL,
    unit TEXT DEFAULT 'kg',
    description TEXT,
    image_url TEXT,
    location TEXT,
    harvest_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'available'
  )`);

  // Orders table
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    buyer_id INTEGER,
    farmer_id INTEGER,
    quantity REAL NOT NULL,
    total_price REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    delivery_address TEXT,
    contact_info TEXT,
    FOREIGN KEY (product_id) REFERENCES products (id)
  )`);

  console.log('Marketplace tables created successfully');
});

// Close connection
db.close((err) => {
  if (err) {
    console.error('Error closing database:', err.message);
  } else {
    console.log('Database connection closed.');
  }
});