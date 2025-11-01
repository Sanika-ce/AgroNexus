// backend/scripts/debug-products.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'marketplace.db');
const db = new sqlite3.Database(dbPath);

console.log('=== PRODUCTS DATABASE DEBUG ===');

// Check all products
db.all('SELECT * FROM products', (err, rows) => {
    if (err) {
        console.error('Error:', err);
        return;
    }
    
    console.log('Total products in database:', rows.length);
    console.log('Products details:');
    rows.forEach(product => {
        console.log(`- ID: ${product.id}, Name: ${product.name}, Farmer ID: ${product.farmer_id}, Farmer: ${product.farmer_name}`);
    });
    
    // Check products for farmer_id = 1
    db.all('SELECT * FROM products WHERE farmer_id = 1', (err, farmerProducts) => {
        console.log('\nProducts for farmer_id = 1:', farmerProducts.length);
        farmerProducts.forEach(product => {
            console.log(`- ${product.name} (ID: ${product.id})`);
        });
        
        db.close();
    });
});