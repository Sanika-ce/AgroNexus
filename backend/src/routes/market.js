// backend/src/routes/market.js - UPDATED WITH AUTH
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connection
const dbPath = path.join(__dirname, '..', '..', 'data', 'marketplace.db');
const db = new sqlite3.Database(dbPath);

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
    // For now, we'll use a simple session check
    // In production, you'd use proper session management or JWT
    const userId = req.headers['user-id'] || req.body.user_id;
    
    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    
    req.userId = parseInt(userId);
    next();
};

// GET all products (public - no auth required)
router.get('/products', (req, res) => {
    const sql = `SELECT * FROM products WHERE status = 'available' ORDER BY created_at DESC`;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).json({ error: 'Failed to fetch products' });
            return;
        }
        res.json({
            message: 'Success',
            data: rows
        });
    });
});

// GET user's products (requires auth)
router.get('/my-products', requireAuth, (req, res) => {
    const sql = `SELECT * FROM products WHERE farmer_id = ? ORDER BY created_at DESC`;
    
    db.all(sql, [req.userId], (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).json({ error: 'Failed to fetch your products' });
            return;
        }
        res.json({
            message: 'Success',
            data: rows
        });
    });
});

// POST - Add new product (requires auth)
router.post('/products', requireAuth, (req, res) => {
    const { name, category, price, quantity, unit, description, location, harvest_date } = req.body;
    
    console.log('Adding product for user:', req.userId);
    console.log('Product data:', { name, category, price, quantity, unit, description, location, harvest_date });
    
    const sql = `INSERT INTO products 
        (farmer_id, name, category, price, quantity, unit, description, location, harvest_date) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [req.userId, name, category, price, quantity, unit, description, location, harvest_date], 
        function(err) {
            if (err) {
                console.error('Database error:', err);
                res.status(500).json({ error: 'Failed to add product' });
                return;
            }
            
            console.log('Product added successfully with ID:', this.lastID);
            
            res.json({
                message: 'Product added successfully',
                productId: this.lastID
            });
        }
    );
});

// DELETE - Remove product (requires auth and ownership)
router.delete('/products/:id', requireAuth, (req, res) => {
    const sql = `DELETE FROM products WHERE id = ? AND farmer_id = ?`;
    
    db.run(sql, [req.params.id, req.userId], function(err) {
        if (err) {
            console.error('Database error:', err);
            res.status(500).json({ error: 'Failed to delete product' });
            return;
        }
        
        if (this.changes === 0) {
            res.status(404).json({ error: 'Product not found or you do not have permission to delete it' });
            return;
        }
        
        res.json({
            message: 'Product deleted successfully'
        });
    });
});

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({ 
        message: 'Marketplace API is working!',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;