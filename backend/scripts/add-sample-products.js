// backend/scripts/add-sample-products.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'marketplace.db');
const db = new sqlite3.Database(dbPath);

const sampleProducts = [
    {
        farmer_id: 1,
        name: 'Organic Tomatoes',
        category: 'Vegetables',
        price: 40,
        quantity: 100,
        unit: 'kg',
        description: 'Fresh organic tomatoes from our farm, grown without pesticides.',
        location: 'Nashik, Maharashtra',
        harvest_date: '2024-01-20'
    },
    {
        farmer_id: 2,
        name: 'Basmati Rice',
        category: 'Grains',
        price: 60,
        quantity: 500,
        unit: 'kg',
        description: 'Premium quality basmati rice, freshly harvested.',
        location: 'Punjab',
        harvest_date: '2024-01-15'
    },
    {
        farmer_id: 1,
        name: 'Alphonso Mangoes',
        category: 'Fruits',
        price: 120,
        quantity: 50,
        unit: 'kg',
        description: 'Sweet and juicy alphonso mangoes, perfect for exports.',
        location: 'Ratnagiri, Maharashtra',
        harvest_date: '2024-02-01'
    }
];

db.serialize(() => {
    // Clear existing sample data
    db.run('DELETE FROM products WHERE farmer_id IN (1, 2)');
    
    // Insert sample products
    const stmt = db.prepare(`INSERT INTO products 
        (farmer_id, name, category, price, quantity, unit, description, location, harvest_date) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    
    sampleProducts.forEach(product => {
        stmt.run([
            product.farmer_id,
            product.name,
            product.category,
            product.price,
            product.quantity,
            product.unit,
            product.description,
            product.location,
            product.harvest_date
        ], (err) => {
            if (err) {
                console.error('Error inserting product:', err);
            } else {
                console.log(`Added: ${product.name}`);
            }
        });
    });
    
    stmt.finalize();
    
    // Verify insertion
    db.all('SELECT * FROM products', (err, rows) => {
        if (err) {
            console.error('Error fetching products:', err);
        } else {
            console.log(`\nTotal products in database: ${rows.length}`);
            rows.forEach(row => {
                console.log(`- ${row.name}: ₹${row.price}/${row.unit} (${row.quantity} ${row.unit} available)`);
            });
        }
        
        db.close();
    });
});

console.log('Adding sample products to marketplace...');