CREATE DATABASE IF NOT EXISTS petalandbow;
USE petalandbow;

-- Drop tables if exist (for clean setup)
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;

-- Create tables
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(10)
);

CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    category_id INT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255),
    stock INT DEFAULT 0,
    description TEXT,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT,
    total_amount DECIMAL(10,2),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending',
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    product_id INT,
    quantity INT,
    price DECIMAL(10,2),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Insert categories
INSERT INTO categories (name, icon) VALUES 
('Bags', '👜'),
('Bracelet', '📿'),
('Earrings', '💎'),
('Hair Accessories', '🎀'),
('Necklace', '📿'),
('Rings', '💍'),
('Sunglasses', '🕶️');

-- Insert all products (5 items per category)

-- Bags (category_id = 1)
INSERT INTO products (name, category_id, price, image_url, stock, description) VALUES 
('White Kitty Purse', 1, 45.99, 'assets/bags/Bag 1.jpeg', 15, 'Spacious and stylish tote bag for everyday use'),
('Pink Style Cutie', 1, 35.99, 'assets/bags/Bag 2.jpeg', 20, 'Compact crossbody bag perfect for outings'),
('Designer White Purse', 1, 52.99, 'assets/bags/Bag 3.jpeg', 12, 'Premium leather shoulder bag'),
('Your Elegant Love', 1, 48.99, 'assets/bags/Bag 4.jpeg', 18, 'Comfortable backpack for daily adventures'),
('Evening Beauty Pink', 1, 32.99, 'assets/bags/Bag 5.jpeg', 10, 'Elegant clutch for special occasions');

-- Bracelets (category_id = 2)
INSERT INTO products (name, category_id, price, image_url, stock, description) VALUES 
('Star Shine Bracelet', 2, 24.99, 'assets/Bracelet/Bracelet 1.jpeg', 25, 'Delicate pearl bracelet with gold chain'),
('Crystal Charm Bracelet', 2, 28.99, 'assets/Bracelet/Bracelet 2.jpeg', 22, 'Sparkling crystal charms on silver band'),
('The Flower Bracelet', 2, 18.99, 'assets/Bracelet/Bracelet 3.jpeg', 30, 'Colorful beaded bracelet set'),
('Royal Blue Bracelet', 2, 35.99, 'assets/Bracelet/Bracelet 4.jpeg', 15, 'Set of 3 elegant gold bangles'),
('Butterfly Love Bracelet', 2, 22.99, 'assets/Bracelet/Bracelet 5.jpeg', 20, 'Boho-style leather wrap with beads');

-- Earrings (category_id = 3)
INSERT INTO products (name, category_id, price, image_url, stock, description) VALUES 
('Golden Studs', 3, 29.99, 'assets/Earrings/Earrings 1.jpeg', 28, 'Classic diamond stud earrings'),
('Lotus Charm Earrings', 3, 22.99, 'assets/Earrings/Earrings 2.jpeg', 32, 'Medium-sized gold hoop earrings'),
('Crystal White Earrings', 3, 26.99, 'assets/Earrings/Earrings 3.jpeg', 25, 'Elegant crystal drop earrings'),
('Purple Pearl Earrings', 3, 31.99, 'assets/Earrings/Earrings 4.jpeg', 20, 'Long pearl dangle earrings'),
('Elegant Beauty Earrings', 3, 19.99, 'assets/Earrings/Earrings 5.jpeg', 35, 'Cute flower-shaped studs');

-- Hair Accessories (category_id = 4)
INSERT INTO products (name, category_id, price, image_url, stock, description) VALUES 
('Silk Hair Bow', 4, 12.99, 'assets/Hair Accessories/Hair 1.jpeg', 40, 'Large silk bow hair clip'),
('Crystal Pink Bow', 4, 15.99, 'assets/Hair Accessories/Hair 2.jpeg', 35, 'Set of 5 decorative hairpins'),
('Flower Clips Set', 4, 14.99, 'assets/Hair Accessories/Hair 3.jpeg', 30, 'Padded velvet headband'),
('Tulip Hair Clips', 4, 18.99, 'assets/Hair Accessories/Hair 4.jpeg', 28, 'Set of pearl-decorated clips'),
('White Beauty Bow', 4, 9.99, 'assets/Hair Accessories/Hair 5.jpeg', 50, 'Pack of 6 satin scrunchies');

-- Necklaces (category_id = 5)
INSERT INTO products (name, category_id, price, image_url, stock, description) VALUES 
('Chain Necklace', 5, 38.99, 'assets/Necklace/Necklace 1.jpeg', 18, 'Trendy layered gold necklace'),
('Ruby Pearl Necklace', 5, 45.99, 'assets/Necklace/Necklace 2.jpeg', 15, 'Classic pearl strand'),
('Bow Pendant Necklace', 5, 32.99, 'assets/Necklace/Necklace 3.jpeg', 22, 'Gold heart pendant with chain'),
('Petal&Bow Special', 5, 28.99, 'assets/Necklace/Necklace 4.jpeg', 20, 'Elegant black velvet choker'),
('Crystal Statement Necklace', 5, 52.99, 'assets/Necklace/Necklace 5.jpeg', 12, 'Bold crystal statement piece');

-- Rings (category_id = 6)
INSERT INTO products (name, category_id, price, image_url, stock, description) VALUES 
('Stackable Ring Set', 6, 89.99, 'assets/rings/Ring 1.jpeg', 8, 'Classic diamond solitaire ring'),
('Diamond Solitaire Ring', 6, 34.99, 'assets/rings/Ring 2.jpeg', 25, 'Set of 5 stackable rings'),
('Rose Gold Ring', 6, 42.99, 'assets/rings/Ring 3.jpeg', 18, 'Simple rose gold band'),
('Pearl Cocktail Ring', 6, 38.99, 'assets/rings/Ring 4.jpeg', 15, 'Statement pearl ring'),
('Star Glow Ring', 6, 28.99, 'assets/rings/Ring 5.jpeg', 22, 'Delicate infinity symbol ring');

-- Sunglasses (category_id = 7)
INSERT INTO products (name, category_id, price, image_url, stock, description) VALUES 
('Cat Eye Sunglasses', 7, 55.99, 'assets/Sunglasses/Glasses 1.jpeg', 16, 'Retro cat eye sunglasses'),
('Aviator Sunglasses', 7, 62.99, 'assets/Sunglasses/Glasses 2.jpeg', 14, 'Classic aviator style'),
('Round Frame Sunglasses', 7, 48.99, 'assets/Sunglasses/Glasses 3.jpeg', 20, 'Vintage round sunglasses'),
('Pearl Love Sunglasses', 7, 58.99, 'assets/Sunglasses/Glasses 4.jpeg', 12, 'Glamorous oversized frames'),
('Butterfly Blue Sunglasses', 7, 45.99, 'assets/Sunglasses/Glasses 5.jpeg', 18, 'Active lifestyle sunglasses');

-- Insert sample customers
INSERT INTO customers (name, email, phone) VALUES 
('Priya Sharma', 'priya.sharma@email.com', '+91 98765 43210'),
('Ananya Patel', 'ananya.patel@email.com', '+91 98765 43211'),
('Riya Gupta', 'riya.gupta@email.com', '+91 98765 43212');

-- Insert sample orders
INSERT INTO orders (customer_id, total_amount, status) VALUES 
(1, 78.98, 'completed'),
(2, 124.97, 'pending'),
(3, 45.99, 'completed');

-- Insert sample order items
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES 
(1, 1, 1, 45.99),
(1, 11, 1, 32.99),
(2, 15, 2, 38.99),
(2, 21, 1, 45.99),
(3, 6, 1, 45.99);

-- Verification queries
SELECT 'Categories Created:' as '';
SELECT * FROM categories;

SELECT 'Total Products per Category:' as '';
SELECT c.name as Category, COUNT(p.id) as Total_Products 
FROM categories c 
LEFT JOIN products p ON c.id = p.category_id 
GROUP BY c.id, c.name;

SELECT 'Sample Products:' as '';
SELECT p.name, c.name as category, p.price, p.stock 
FROM products p 
JOIN categories c ON p.category_id = c.id 
LIMIT 10;

SELECT 'Orders Summary:' as '';
SELECT o.id, cu.name as customer, o.total_amount, o.status 
FROM orders o 
JOIN customers cu ON o.customer_id = cu.id;

INSERT INTO products (name, category_id, price, image_url, stock) 
VALUES ('Bag 3', 1, 32.99, 'assets/bags/Bag 3.jpeg', 15);

SELECT * FROM products WHERE name = 'Bag 3';
UPDATE products SET price = 29.99 WHERE id = 1;
SHOW TABLES;

DESCRIBE products;
DESCRIBE orders;
DESCRIBE customers;

SELECT * FROM categories;
SELECT * FROM products;
SELECT * FROM customers;
SELECT * FROM orders;
SELECT * FROM order_items;
