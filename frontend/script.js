const API_URL = 'http://localhost:5000/api';
let products = [];
let cart = [];
let categories = [];

// Load data on page load
window.onload = async () => {
    await loadCategories();
    await loadProducts();
    updateCart();
};

async function loadCategories() {
    const res = await fetch(`${API_URL}/categories`);
    categories = await res.json();
    
    const filterDiv = document.getElementById('categoryFilters');
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.innerHTML = `<span class="icon">${cat.icon}</span> ${cat.name}`;
        btn.dataset.category = cat.id;
        btn.onclick = () => filterProducts(cat.id);
        filterDiv.appendChild(btn);
    });
}

async function loadProducts() {
    const res = await fetch(`${API_URL}/products`);
    products = await res.json();
    displayProducts(products);
}

function displayProducts(prods) {
    const grid = document.getElementById('products');
    grid.innerHTML = '';
    
    prods.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${p.image_url}" alt="${p.name}">
            <div class="product-info">
                <h3>${p.name}</h3>
                <p class="category">${p.category_name}</p>
                <p class="price">${p.price}</p>
                <p class="stock">Stock: ${p.stock}</p>
                <button onclick="addToCart(${p.id})" ${p.stock === 0 ? 'disabled' : ''}>
                    ${p.stock === 0 ? '❌ Out of Stock' : '🛒 Add to Cart'}
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function filterProducts(catId) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (catId === 'all') {
        displayProducts(products);
        document.querySelector('[data-category="all"]').classList.add('active');
    } else {
        const filtered = products.filter(p => p.category_id == catId);
        displayProducts(filtered);
        document.querySelector(`[data-category="${catId}"]`).classList.add('active');
    }
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({...product, quantity: 1});
    }
    
    updateCart();
}

function updateCart() {
    document.getElementById('cartCount').textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartDiv = document.getElementById('cartItems');
    cartDiv.innerHTML = '';
    
    if (cart.length === 0) {
        cartDiv.innerHTML = '<p>Your cart is empty</p>';
        document.getElementById('cartTotal').textContent = '0.00';
        return;
    }
    
    cart.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <span>${item.name}</span>
            <span>
                <button onclick="changeQty(${item.id}, -1)">-</button>
                ${item.quantity}
                <button onclick="changeQty(${item.id}, 1)">+</button>
            </span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
            <button onclick="removeFromCart(${item.id})">Remove</button>
        `;
        cartDiv.appendChild(div);
    });
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('cartTotal').textContent = total.toFixed(2);
}

function changeQty(productId, change) {
    const item = cart.find(i => i.id === productId);
    item.quantity += change;
    if (item.quantity <= 0) removeFromCart(productId);
    else updateCart();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

function toggleCart() {
    const modal = document.getElementById('cartModal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
}

function showCheckout() {
    if (cart.length === 0) {
        alert('Cart is empty!');
        return;
    }
    document.getElementById('cartModal').style.display = 'none';
    document.getElementById('checkoutModal').style.display = 'block';
}

function closeCheckout() {
    document.getElementById('checkoutModal').style.display = 'none';
}

document.getElementById('checkoutForm').onsubmit = async (e) => {
    e.preventDefault();
    
    const customer = {
        name: document.getElementById('customerName').value,
        email: document.getElementById('customerEmail').value,
        phone: document.getElementById('customerPhone').value
    };
    
    try {
        const res = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({customer, cart})
        });
        
        const data = await res.json();
        alert(`Order placed successfully! Order ID: ${data.order_id}`);
        cart = [];
        updateCart();
        closeCheckout();
    } catch (err) {
        alert('Error placing order: ' + err.message);
    }
};
