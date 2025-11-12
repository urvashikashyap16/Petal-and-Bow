import mysql.connector
from mysql.connector import Error

def get_connection():
    try:
        conn = mysql.connector.connect(
            host='localhost',
            database='petalandbow',
            user='root',
            password='Anoopurvashi16@'  # Update this if your password changes
        )
        if conn.is_connected():
            return conn
        else:
            print("Connection NOT established!")
            return None
    except Error as e:
        print(f"Database Error: {e}")
        return None

def get_all_products():
    conn = get_connection()
    if not conn:
        print("Failed DB connection in get_all_products")
        return []
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT p.*, c.name as category_name, c.icon as category_icon 
            FROM products p 
            JOIN categories c ON p.category_id = c.id
            ORDER BY c.id, p.id
        """)
        products = cursor.fetchall()
        cursor.close()
        conn.close()
        return products
    except Error as e:
        print(f"Query Error (get_all_products): {e}")
        if conn:
            conn.close()
        return []

def get_categories():
    conn = get_connection()
    if not conn:
        print("Failed DB connection in get_categories")
        return []
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM categories")
        categories = cursor.fetchall()
        cursor.close()
        conn.close()
        return categories
    except Error as e:
        print(f"Query Error (get_categories): {e}")
        if conn:
            conn.close()
        return []

def create_order(customer_data, cart_items):
    conn = get_connection()
    if not conn:
        raise Exception("Database connection failed")
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO customers (name, email, phone) 
            VALUES (%s, %s, %s)
        """, (customer_data['name'], customer_data['email'], customer_data['phone']))
        customer_id = cursor.lastrowid

        total = sum(item['price'] * item['quantity'] for item in cart_items)
        cursor.execute("""
            INSERT INTO orders (customer_id, total_amount) 
            VALUES (%s, %s)
        """, (customer_id, total))
        order_id = cursor.lastrowid

        for item in cart_items:
            cursor.execute("""
                INSERT INTO order_items (order_id, product_id, quantity, price)
                VALUES (%s, %s, %s, %s)
            """, (order_id, item['id'], item['quantity'], item['price']))
            cursor.execute("""
                UPDATE products SET stock = stock - %s WHERE id = %s
            """, (item['quantity'], item['id']))

        conn.commit()
        cursor.close()
        conn.close()
        return order_id
    except Error as e:
        print(f"Order Error: {e}")
        if conn:
            conn.rollback()
            conn.close()
        raise Exception(f"Failed to create order: {e}")
