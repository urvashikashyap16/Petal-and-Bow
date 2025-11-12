from flask import Flask, jsonify, request
from flask_cors import CORS
import database as db

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})  # Enables CORS for all API frontend requests

@app.route('/api/products', methods=['GET'])
def get_products():
    products = db.get_all_products()
    return jsonify(products)

@app.route('/api/products/add', methods=['POST'])
def add_product():
    data = request.json
    result = db.add_product(data)
    return jsonify(result)

@app.route('/api/products/<int:id>', methods=['DELETE'])
def delete_product(id):
    result = db.delete_product(id)
    return jsonify(result)

@app.route('/api/categories', methods=['GET'])
def get_categories():
    categories = db.get_categories()
    return jsonify(categories)

@app.route('/api/orders', methods=['GET'])
def get_orders():
    orders = db.get_all_orders()
    return jsonify(orders)

@app.route('/api/orders', methods=['POST'])
def create_order():
    data = request.json
    customer = data['customer']
    cart = data['cart']
    
    order_id = db.create_order(customer, cart)
    return jsonify({'order_id': order_id, 'message': 'Order placed successfully!'})

@app.route('/api/customers', methods=['GET'])
def get_customers():
    customers = db.get_all_customers()
    return jsonify(customers)

@app.route('/api/order-items', methods=['GET'])
def get_order_items():
    items = db.get_all_order_items()
    return jsonify(items)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
