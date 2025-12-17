document.addEventListener('DOMContentLoaded', function() {
    // Initialize products and cart from localStorage (prices in INR)
    // 1. DATA DEFINITION
    let products = JSON.parse(localStorage.getItem('products')) || [
        { id: 1, name: 'Copper Electric Wire (100ft)', price: 4149.17, category: 'electric', image: 'https://via.placeholder.com/300x200?text=Electric+Wire' },
        { id: 2, name: 'Steel Farming Hoe', price: 1659.17, category: 'farming', image: 'https://via.placeholder.com/300x200?text=Farming+Hoe' },
        { id: 3, name: 'Professional Hammer Set', price: 2429.17, category: 'tools', image: 'https://via.placeholder.com/300x200?text=Hammer+Set' },
        { id: 4, name: 'PVC Pipes (10ft Pack)', price: 3239.17, category: 'pipes', image: 'https://via.placeholder.com/300x200?text=PVC+Pipes' }
    ];
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let isAdmin = localStorage.getItem('isAdmin') === 'true';

    console.log('Script loaded. isAdmin:', isAdmin);

    // 2. PAGE ROUTING & CHECKS
    // Show admin link if logged in
    if (isAdmin && document.getElementById('admin-link')) {
        document.getElementById('admin-link').style.display = 'block';
    }

    // Check admin access on admin.html
    if (window.location.pathname.includes('admin.html') && !isAdmin) {
        window.location.href = 'login.html';
    }

    // Load content based on which page we are on
    if (document.getElementById('product-list')) loadProducts();
    if (document.getElementById('cart-content')) loadCart();
    if (document.getElementById('product-manage-list')) loadAdminProducts();

    // 3. EVENT LISTENERS
    // Login functionality
    if (document.getElementById('login-form')) {
        document.getElementById('login-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const pass = document.getElementById('password').value;
            const errorDiv = document.getElementById('login-error');
            
            if (username === 'admin' && pass === 'admin123') {
                localStorage.setItem('isAdmin', 'true');
                window.location.href = 'admin.html';
            } else {
                errorDiv.style.display = 'block';
            }
        });
    }

    // Logout
    if (document.getElementById('logout-btn')) {
        document.getElementById('logout-btn').addEventListener('click', function() {
            localStorage.removeItem('isAdmin');
            window.location.href = 'index.html';
        });
    }

    // Add product (admin)
    if (document.getElementById('add-product-form')) {
        document.getElementById('add-product-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('product-name').value;
            const price = parseFloat(document.getElementById('product-price').value);
            const category = document.getElementById('product-category').value;
            const image = document.getElementById('product-image').value;
            
            products.push({ id: Date.now(), name, price, category, image });
            localStorage.setItem('products', JSON.stringify(products));
            loadAdminProducts();
            this.reset();
            alert('Product added!');
        });
    }

    // Checkout
    if (document.getElementById('checkout-btn')) {
        document.getElementById('checkout-btn').addEventListener('click', function() {
            alert('Checkout functionality would integrate with a payment gateway like Stripe here.');
        });
    }

    // Contact form
    if (document.getElementById('contact-form')) {
        document.getElementById('contact-form').addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for your message! We will get back to you soon.');
            this.reset();
        });
    }

    // 4. CORE FUNCTIONS
    function loadProducts() {
        const list = document.getElementById('product-list');
        list.innerHTML = '';
        
        const urlParams = new URLSearchParams(window.location.search);
        const selectedCategory = urlParams.get('category');
        
        let filteredProducts = products;
        if (selectedCategory) {
            filteredProducts = products.filter(product => product.category === selectedCategory);
            const titleElement = document.getElementById('category-title');
            if (titleElement) {
                titleElement.textContent = selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) + ' Products';
            }
        }
        
        if(filteredProducts.length === 0) {
            list.innerHTML = '<p>No products found.</p>';
            return;
        }

        filteredProducts.forEach(product => {
            // UPDATED SECTION: Added classes for uniform height (h-100, d-flex, mt-auto)
            list.innerHTML += `
                <div class="col-md-3 mb-4">
                    <div class="card product-card h-100" data-category="${product.category}">
                        <img src="${product.image}" class="card-img-top" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x200'">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${product.name}</h5>
                            
                            <div class="mt-auto">
                                <p class="card-text fw-bold">₹${product.price.toFixed(2)}</p>
                                <button class="btn btn-primary w-100 add-to-cart" data-id="${product.id}">Add to Cart</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        // Attach add-to-cart events
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                const product = products.find(p => p.id === id);
                const existing = cart.find(item => item.id === id);
                
                if (existing) {
                    existing.quantity += 1;
                } else {
                    cart.push({ ...product, quantity: 1 });
                }
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartCount();
                alert(`${product.name} added to cart!`);
            });
        });
        updateCartCount();
    }

    function loadCart() {
        const content = document.getElementById('cart-content');
        content.innerHTML = '';
        let subtotal = 0;
        
        if (cart.length === 0) {
            content.innerHTML = '<p>Your cart is empty.</p>';
        } else {
            cart.forEach((item, index) => {
                const itemTotal = item.price * item.quantity;
                subtotal += itemTotal;
                content.innerHTML += `
                    <div class="cart-item">
                        <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/100'">
                        <div class="cart-details">
                            <h5>${item.name}</h5>
                            <p>₹${item.price.toFixed(2)} each</p>
                            <div class="quantity-controls">
                                <button class="btn btn-sm btn-outline-secondary" onclick="changeQuantity(${index}, -1)">-</button>
                                <span class="mx-2">${item.quantity}</span>
                                <button class="btn btn-sm btn-outline-secondary" onclick="changeQuantity(${index}, 1)">+</button>
                            </div>
                            <button class="btn btn-sm btn-danger" onclick="removeFromCart(${index})">Remove</button>
                        </div>
                        <div class="text-end">
                            <p><strong>₹${itemTotal.toFixed(2)}</strong></p>
                        </div>
                    </div>
                `;
            });
        }
        if(document.getElementById('cart-subtotal')) {
            document.getElementById('cart-subtotal').textContent = subtotal.toFixed(2);
        }
    }

    function loadAdminProducts() {
        const list = document.getElementById('product-manage-list');
        list.innerHTML = '';
        products.forEach((product, index) => {
            list.innerHTML += `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    ${product.name} - ₹${product.price.toFixed(2)}
                    <button class="btn btn-sm btn-danger" onclick="deleteProduct(${index})">Delete</button>
                </li>
            `;
        });
    }

    function updateCartCount() {
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (document.getElementById('cart-count')) {
            document.getElementById('cart-count').textContent = count;
        }
    }

    // 5. GLOBAL HELPERS (Required for onclick="" in HTML)
    window.changeQuantity = function(index, delta) {
        cart[index].quantity += delta;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCart();
        updateCartCount();
    };

    window.removeFromCart = function(index) {
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCart();
        updateCartCount();
    };

    window.deleteProduct = function(index) {
        if(confirm('Are you sure you want to delete this product?')) {
            products.splice(index, 1);
            localStorage.setItem('products', JSON.stringify(products));
            loadAdminProducts();
        }
    };
});
