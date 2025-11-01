// marketplace.js - FIXED FOR CROSS-PORT ISSUE
class Marketplace {
    constructor() {
        this.products = [];
        this.myProducts = [];
        // Dynamic API base - works in both development and production
        this.apiBase = window.location.port === '5502' 
            ? 'http://localhost:3000/api/market'  // When frontend on port 5502
            : '/api/market';                      // When same origin
        
        console.log('🌐 API Base:', this.apiBase);
        console.log('📍 Current origin:', window.location.origin);
        this.searchTerm = '';
        this.selectedCategory = '';
        this.sortBy = 'newest';
        this.currentUser = null;
        this.isLoggedIn = false;
        this.init();
    }

    async init() {
        console.log('Marketplace initializing...');
        this.setupFormHandlers();
        this.setupSearchFilters();
        this.checkAuthStatus();
        await this.loadProducts();
    }

    async checkAuthStatus() {
        try {
            // Check if user data exists in localStorage (simple auth)
            const userData = localStorage.getItem('agronexus_user');
            if (userData) {
                this.currentUser = JSON.parse(userData);
                this.isLoggedIn = true;
                this.updateUIForAuth();
            }
        } catch (error) {
            console.error('Auth check error:', error);
        }
    }

    updateUIForAuth() {
        const authButtons = document.querySelector('.auth-buttons');
        const addProductBtn = document.querySelector('.add-product-btn');
        
        if (this.isLoggedIn && authButtons) {
            authButtons.innerHTML = `
                <span style="margin-right: 15px; color: #2ecc71; font-weight: 600;">
                    👋 ${this.currentUser.name}
                </span>
                <button class="btn btn-outline" onclick="marketplace.viewMyProducts()">My Products</button>
                <button class="btn btn-outline" onclick="marketplace.logout()">Logout</button>
            `;
        }
        
        if (addProductBtn) {
            if (this.isLoggedIn) {
                addProductBtn.style.display = 'block';
            } else {
                addProductBtn.style.display = 'none';
            }
        }
    }

    // Simulate login (you'll integrate with your actual auth system)
    async login(userData) {
        try {
            // Store user data in localStorage
            localStorage.setItem('agronexus_user', JSON.stringify(userData));
            this.currentUser = userData;
            this.isLoggedIn = true;
            this.updateUIForAuth();
            
            // Load user's products
            await this.loadMyProducts();
            
            return true;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('agronexus_user');
            alert('You have been logged out successfully!');
            this.currentUser = null;
            this.isLoggedIn = false;
            this.updateUIForAuth();
            window.location.reload();
        }
    }

    // Load user's products
    async loadMyProducts() {
        if (!this.isLoggedIn) {
            console.log('Not logged in, skipping my products load');
            return;
        }
        
        try {
            console.log('Loading my products for user:', this.currentUser.id);
            
            const response = await fetch(`${this.apiBase}/my-products`, {
                headers: {
                    'User-ID': this.currentUser.id.toString()
                }
            });
            
            console.log('My products response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('My products loaded:', data.data.length);
                this.myProducts = data.data;
            } else {
                console.error('Failed to load my products:', await response.text());
            }
        } catch (error) {
            console.error('Error loading my products:', error);
        }
    }

    // View user's products
    viewMyProducts() {
        if (!this.isLoggedIn) {
            alert('Please login to view your products');
            return;
        }
        
        const container = document.getElementById('products-container');
        if (this.myProducts.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <h3>You haven't listed any products yet</h3>
                    <p>Start by adding your first product!</p>
                    <button onclick="openAddProductModal()" style="padding: 10px 20px; background: #2ecc71; color: white; border: none; border-radius: 6px; cursor: pointer; margin-top: 15px;">
                        Add Your First Product
                    </button>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div style="margin-bottom: 20px;">
                    <h3>My Products (${this.myProducts.length})</h3>
                </div>
                <div class="products-grid">
                    ${this.myProducts.map(product => this.createMyProductCard(product)).join('')}
                </div>
            `;
        }
    }

    createMyProductCard(product) {
        return `
            <div class="product-card">
                <div class="product-image">
                    ${product.image_url ? 
                        `<img src="${product.image_url}" alt="${product.name}" style="max-width: 100%; max-height: 200px; border-radius: 8px;">` : 
                        '🌱'
                    }
                </div>
                <h3>${product.name}</h3>
                <p style="color: #666; font-size: 0.9em; margin-bottom: 10px;">${product.description ? product.description.substring(0, 100) + '...' : 'No description available'}</p>
                <div class="product-price">₹${product.price} / ${product.unit}</div>
                <div class="product-meta">
                    <span><strong>Qty:</strong> ${product.quantity} ${product.unit}</span>
                    <span><strong>Status:</strong> ${product.status}</span>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <button onclick="marketplace.editProduct(${product.id})" style="flex: 1; padding: 8px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Edit
                    </button>
                    <button onclick="marketplace.deleteProduct(${product.id})" style="flex: 1; padding: 8px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Delete
                    </button>
                </div>
            </div>
        `;
    }

    // Add product with authentication
    async addProduct(productData) {
        if (!this.isLoggedIn) {
            alert('Please login to add products');
            return;
        }
        
        try {
            console.log('Adding product:', productData);
            
            const response = await fetch(`${this.apiBase}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-ID': this.currentUser.id.toString()
                },
                body: JSON.stringify(productData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Product added successfully:', result);
            
            this.closeAddProductModal();
            await this.loadProducts();
            await this.loadMyProducts();
            
            alert('Product listed successfully!');
            
        } catch (error) {
            console.error('Error adding product:', error);
            alert('Failed to list product: ' + error.message);
        }
    }

    // Delete product
    async deleteProduct(productId) {
        if (!this.isLoggedIn) {
            alert('Please login to delete products');
            return;
        }
        
        if (!confirm('Are you sure you want to delete this product?')) {
            return;
        }
        
        try {
            const response = await fetch(`${this.apiBase}/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'User-ID': this.currentUser.id.toString()
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            await this.loadProducts();
            await this.loadMyProducts();
            
            alert('Product deleted successfully!');
            
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product: ' + error.message);
        }
    }

    setupSearchFilters() {
        const searchInput = document.getElementById('searchInput');
        const categoryFilter = document.getElementById('categoryFilter');
        const sortFilter = document.getElementById('sortFilter');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.filterAndDisplayProducts();
            });
        }

        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.selectedCategory = e.target.value;
                this.filterAndDisplayProducts();
            });
        }

        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.filterAndDisplayProducts();
            });
        }
    }

    filterAndDisplayProducts() {
        let filteredProducts = [...this.products];

        // Search filter
        if (this.searchTerm) {
            filteredProducts = filteredProducts.filter(product =>
                product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                product.location.toLowerCase().includes(this.searchTerm.toLowerCase())
            );
        }

        // Category filter
        if (this.selectedCategory) {
            filteredProducts = filteredProducts.filter(product =>
                product.category === this.selectedCategory
            );
        }

        // Sort products
        switch (this.sortBy) {
            case 'price-low':
                filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
            default:
                filteredProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
        }

        this.displayFilteredProducts(filteredProducts);
    }

    displayFilteredProducts(filteredProducts) {
        const container = document.getElementById('products-container');
        
        if (filteredProducts.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <h3>No products found</h3>
                    <p>Try adjusting your search or filters</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="products-grid">
                ${filteredProducts.map(product => this.createProductCard(product)).join('')}
            </div>
        `;
    }

    setupFormHandlers() {
        const form = document.getElementById('addProductForm');
        if (form) {
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                this.handleFormSubmit();
            });
            console.log('Form handlers setup complete');
        } else {
            console.log('Add product form not found - make sure modal HTML is added');
        }
    }

    updateStatistics() {
        const totalProducts = document.getElementById('total-products');
        const activeFarmers = document.getElementById('active-farmers');
        
        if (totalProducts) {
            totalProducts.textContent = this.products.length;
        }
        
        if (activeFarmers) {
            // Count unique farmers
            const uniqueFarmers = new Set(this.products.map(product => product.farmer_id));
            activeFarmers.textContent = uniqueFarmers.size;
        }
    }

    async loadProducts() {
        try {
            const apiUrl = `${this.apiBase}/products`;
            console.log('🔄 Loading products from:', apiUrl);
            
            const response = await fetch(apiUrl);
            
            console.log('✅ Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📦 Products loaded:', data.data.length);
            
            if (data.message === 'Success') {
                this.products = data.data;
                this.updateStatistics();
                this.filterAndDisplayProducts();
            } else {
                this.showError('Failed to load products: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('❌ Error loading products:', error);
            this.showError(`Cannot connect to marketplace: ${error.message}. Make sure backend is running on port 3000.`);
        }
    }

    displayProducts() {
        const container = document.getElementById('products-container');
        if (!container) {
            console.error('Products container not found!');
            return;
        }
        
        console.log('Displaying products:', this.products.length);
        
        if (this.products.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <h3>No products available yet</h3>
                    <p>Be the first to list your produce!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="products-grid">
                ${this.products.map(product => this.createProductCard(product)).join('')}
            </div>
        `;
    }

    createProductCard(product) {
        return `
            <div class="product-card">
                <div class="product-image">
                    ${product.image_url ? 
                        `<img src="${product.image_url}" alt="${product.name}" style="max-width: 100%; max-height: 200px; border-radius: 8px;">` : 
                        '🌱'
                    }
                </div>
                <h3>${product.name}</h3>
                <p style="color: #666; font-size: 0.9em; margin-bottom: 10px;">${product.description ? product.description.substring(0, 100) + '...' : 'No description available'}</p>
                <div class="product-price">₹${product.price} / ${product.unit}</div>
                <div class="product-meta">
                    <span><strong>Qty:</strong> ${product.quantity} ${product.unit}</span>
                    <span><strong>Location:</strong> ${product.location ? product.location.substring(0, 15) + '...' : 'N/A'}</span>
                </div>
                <button onclick="marketplace.viewProduct(${product.id})" style="margin-top: 15px; padding: 10px 20px; background: #2ecc71; color: white; border: none; border-radius: 6px; cursor: pointer; width: 100%; font-weight: 600;">
                    View Details & Contact
                </button>
            </div>
        `;
    }

    viewProduct(productId) {
        alert(`Viewing product ${productId} - This will be implemented in next step!`);
    }

    showError(message) {
        const container = document.getElementById('products-container');
        if (!container) {
            console.error('Cannot show error - container not found');
            return;
        }
        
        container.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #e74c3c;">
                <h3>Error</h3>
                <p>${message}</p>
                <p><small>Backend should be running on http://localhost:3000</small></p>
                <button onclick="marketplace.loadProducts()" style="padding: 8px 16px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Retry
                </button>
            </div>
        `;
    }


    
    // Add Product Methods
    openAddProductModal() {
        const modal = document.getElementById('addProductModal');
        if (modal) {
            modal.style.display = 'block';
            // Prevent body scrolling when modal is open
            document.body.style.overflow = 'hidden';
        } else {
            console.error('Add product modal not found');
        }
    }

    closeAddProductModal() {
        const modal = document.getElementById('addProductModal');
        if (modal) {
            modal.style.display = 'none';
            // Restore body scrolling
            document.body.style.overflow = 'auto';
            // Reset form
            const form = document.getElementById('addProductForm');
            if (form) form.reset();
        }
    }

    // Update addProduct method
    async addProduct(productData) {
        if (!this.isLoggedIn) {
            alert('Please login to add products');
            return;
        }
        
        try {
            console.log('Adding product for user:', this.currentUser.id);
            
            const response = await fetch(`${this.apiBase}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-ID': this.currentUser.id.toString()
                },
                body: JSON.stringify(productData)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server error:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Product added successfully:', result);
            
            this.closeAddProductModal();
            
            // Reload both product lists
            await this.loadProducts();
            await this.loadMyProducts();
            
            // Debug to verify
            await this.debugUserProducts();
            
            alert('Product listed successfully!');
            
        } catch (error) {
            console.error('Error adding product:', error);
            alert('Failed to list product: ' + error.message);
        }
    }

    handleFormSubmit() {
    const productData = {
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        quantity: parseFloat(document.getElementById('productQuantity').value),
        unit: document.getElementById('productUnit').value,
        description: document.getElementById('productDescription').value,
        location: document.getElementById('productLocation').value,
        harvest_date: document.getElementById('productHarvestDate').value
    };
        
        // Basic validation
        if (!productData.name || !productData.category || !productData.price || !productData.quantity || !productData.location) {
            alert('Please fill in all required fields (marked with *)');
            return;
        }
        
        if (productData.price <= 0) {
            alert('Price must be greater than 0');
            return;
        }
        
        if (productData.quantity <= 0) {
            alert('Quantity must be greater than 0');
            return;
        }
        
        this.addProduct(productData);
    }

    // Add this debug method to Marketplace class
    async debugUserProducts() {
        console.log('=== DEBUG INFO ===');
        console.log('Current User:', this.currentUser);
        console.log('Is Logged In:', this.isLoggedIn);
        console.log('My Products Count:', this.myProducts.length);
        console.log('All Products Count:', this.products.length);
        
        if (this.isLoggedIn) {
            try {
                const response = await fetch(`${this.apiBase}/my-products`, {
                    headers: {
                        'User-ID': this.currentUser.id.toString()
                    }
                });
                
                console.log('My Products API Response Status:', response.status);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('My Products API Data:', data);
                } else {
                    console.log('My Products API Error:', await response.text());
                }
            } catch (error) {
                console.error('My Products API Call Error:', error);
            }
        }
    }
}

// Global functions for modal (called from HTML)
function openAddProductModal() {
    if (typeof marketplace !== 'undefined') {
        marketplace.openAddProductModal();
    } else {
        console.error('Marketplace not initialized');
    }
}

function closeAddProductModal() {
    if (typeof marketplace !== 'undefined') {
        marketplace.closeAddProductModal();
    } else {
        console.error('Marketplace not initialized');
    }
}

// Update demoLogin function
function demoLogin() {
    const userData = {
        id: 1,  // Use consistent ID
        name: 'Demo Farmer',
        email: 'farmer@demo.com',
        type: 'farmer'
    };
    
    marketplace.login(userData);
    
    // Call debug after login
    setTimeout(() => {
        marketplace.debugUserProducts();
    }, 1000);
}

// Initialize marketplace when page loads
const marketplace = new Marketplace();