const API_URL = 'http://localhost:5000/api';

window.onload = () => {
    loadProducts();
    loadCategories();
    loadOrders();
    loadCustomers();
    loadOrderItems();
    
    // Setup event listeners
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            showTab(this.dataset.tab);
        });
    });
    
    document.getElementById('addProductBtn').addEventListener('click', showAddProduct);
    document.getElementById('closeModalBtn').addEventListener('click', closeAddProduct);
};

function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(`${tabName}-tab`).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

async function loadProducts() {
    try {
        const res = await fetch(`${API_URL}/products`);
        const products = await res.json();
        
        const tbody = document.querySelector('#productsTable tbody');
        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No products yet</td></tr>';
            return;
        }
        
        tbody.innerHTML = products.map(p => `
            <tr>
                <td>${p.id}</td>
                <td>${p.name}</td>
                <td>${p.category_name}</td>
                <td>$${p.price}</td>
                <td>${p.stock}</td>
                <td>${p.image_url}</td>
                <td>
                    <button class="action-btn delete" data-delete="${p.id}">Delete</button>
                </td>
            </tr>
        `).join('');
        
        // Add delete listeners
        document.querySelectorAll('[data-delete]').forEach(btn => {
            btn.addEventListener('click', function() {
                deleteProduct(this.dataset.delete);
            });
        });
    } catch (err) {
        console.error('Error loading products:', err);
        document.querySelector('#productsTable tbody').innerHTML = 
            '<tr><td colspan="7" style="text-align:center;color:red;">Error loading products</td></tr>';
    }
}

async function loadCategories() {
    try {
        const res = await fetch(`${API_URL}/categories`);
        const categories = await res.json();
        
        // Populate table
        const tbody = document.querySelector('#categoriesTable tbody');
        const categoryProducts = await Promise.all(
            categories.map(async cat => {
                const prodRes = await fetch(`${API_URL}/products`);
                const allProducts = await prodRes.json();
                const count = allProducts.filter(p => p.category_id === cat.id).length;
                return { ...cat, count };
            })
        );
        
        tbody.innerHTML = categoryProducts.map(c => `
            <tr>
                <td>${c.id}</td>
                <td>${c.name}</td>
                <td style="font-size: 1.5em">${c.icon}</td>
                <td>${c.count} products</td>
            </tr>
        `).join('');
        
        // Populate select in add form
        const select = document.getElementById('categoryId');
        select.innerHTML = categories.map(c => 
            `<option value="${c.id}">${c.icon} ${c.name}</option>`
        ).join('');
    } catch (err) {
        console.error('Error loading categories:', err);
    }
}

async function loadOrders() {
    try {
        const res = await fetch(`${API_URL}/orders`);
        const orders = await res.json();
        console.log('Orders:', orders);
        
        const tbody = document.querySelector('#ordersTable tbody');
        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No orders yet</td></tr>';
            return;
        }
        
        tbody.innerHTML = orders.map(o => `
            <tr>
                <td>#${o.id}</td>
                <td>${o.customer_name}</td>
                <td>${o.customer_email}</td>
                <td>$${o.total_amount}</td>
                <td><span class="status-badge status-${o.status}">${o.status}</span></td>
                <td>${new Date(o.order_date).toLocaleString()}</td>
                <td>
                    <button class="action-btn" data-view="${o.id}">View</button>
                </td>
            </tr>
        `).join('');
        
        // Add view listeners
        document.querySelectorAll('[data-view]').forEach(btn => {
            btn.addEventListener('click', function() {
                viewOrderDetails(this.dataset.view);
            });
        });
    } catch (err) {
        console.error('Error loading orders:', err);
        document.querySelector('#ordersTable tbody').innerHTML = 
            '<tr><td colspan="7" style="text-align:center;color:red;">Error loading orders</td></tr>';
    }
}

async function loadCustomers() {
    try {
        const res = await fetch(`${API_URL}/customers`);
        const customers = await res.json();
        console.log('Customers:', customers);
        
        const tbody = document.querySelector('#customersTable tbody');
        if (customers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No customers yet</td></tr>';
            return;
        }
        
        tbody.innerHTML = customers.map(c => `
            <tr>
                <td>${c.id}</td>
                <td>${c.name}</td>
                <td>${c.email}</td>
                <td>${c.phone}</td>
                <td>${new Date(c.created_at).toLocaleDateString()}</td>
                <td>${c.order_count || 0} orders</td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error loading customers:', err);
        document.querySelector('#customersTable tbody').innerHTML = 
            '<tr><td colspan="6" style="text-align:center;color:red;">Error loading customers</td></tr>';
    }
}

async function loadOrderItems() {
    try {
        const res = await fetch(`${API_URL}/order-items`);
        const items = await res.json();
        console.log('Order Items:', items);
        
        const tbody = document.querySelector('#orderItemsTable tbody');
        if (items.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No order items yet</td></tr>';
            return;
        }
        
        tbody.innerHTML = items.map(i => `
            <tr>
                <td>${i.id}</td>
                <td>#${i.order_id}</td>
                <td>${i.product_name}</td>
                <td>${i.quantity}</td>
                <td>$${i.price}</td>
                <td>$${(i.quantity * i.price).toFixed(2)}</td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error loading order items:', err);
        document.querySelector('#orderItemsTable tbody').innerHTML = 
            '<tr><td colspan="6" style="text-align:center;color:red;">Error loading order items</td></tr>';
    }
}

function showAddProduct() {
    document.getElementById('addProductModal').style.display = 'block';
}

function closeAddProduct() {
    document.getElementById('addProductModal').style.display = 'none';
}

document.getElementById('addProductForm').onsubmit = async (e) => {
    e.preventDefault();
    
    const data = {
        name: document.getElementById('productName').value,
        category_id: document.getElementById('categoryId').value,
        price: document.getElementById('price').value,
        stock: document.getElementById('stock').value,
        image_url: document.getElementById('imageUrl').value,
        description: document.getElementById('description').value
    };
    
    try {
        const res = await fetch(`${API_URL}/products/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (res.ok) {
            alert('Product added successfully!');
            closeAddProduct();
            loadProducts();
            document.getElementById('addProductForm').reset();
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
};

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        const res = await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
        if (res.ok) {
            alert('Product deleted!');
            loadProducts();
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

function viewOrderDetails(orderId) {
    alert(`Order #${orderId} details:\nCheck Order Items tab for full details`);
}