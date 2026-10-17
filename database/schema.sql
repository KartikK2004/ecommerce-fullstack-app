-- =====================================================
-- ShopEase - complete MySQL schema (7 tables)
-- Run: mysql -u root -p < database/schema.sql
-- =====================================================

CREATE DATABASE IF NOT EXISTS ecommerce_db;
USE ecommerce_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,          -- bcrypt hash, never plain text
    role ENUM('customer', 'admin') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    image_url VARCHAR(255),
    category_id INT,
    discount_percent INT DEFAULT 0,          -- 0 = not on sale
    sizes VARCHAR(100) DEFAULT NULL,         -- e.g. 'S,M,L,XL'; NULL = no size needed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    size VARCHAR(10) DEFAULT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'paid', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    shipping_address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price_at_purchase DECIMAL(10,2) NOT NULL,  -- price snapshot so later changes don't affect old orders
    size VARCHAR(10) DEFAULT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (user_id, product_id)
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_cart_user ON cart(user_id);

-- =====================================================
-- Sample data so a fresh install is not empty
-- =====================================================
INSERT INTO categories (name) VALUES
('Men'), ('Women'), ('Kids'), ('Beauty'), ('Footwear'), ('Accessories');

INSERT INTO products (name, description, price, stock, image_url, category_id, discount_percent, sizes) VALUES
('Men''s Formal Shirt', 'Slim-fit cotton formal shirt', 899.00, 40,
  'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400',
  (SELECT id FROM categories WHERE name = 'Men'), 20, 'S,M,L,XL'),
('Women''s Floral Dress', 'Summer floral print dress, breathable fabric', 1299.00, 30,
  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
  (SELECT id FROM categories WHERE name = 'Women'), 0, 'XS,S,M,L,XL'),
('Kids Cartoon T-Shirt', 'Soft cotton t-shirt with cartoon print', 349.00, 50,
  'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=400',
  (SELECT id FROM categories WHERE name = 'Kids'), 0, 'XS,S,M,L'),
('Face Moisturizer', 'Hydrating daily face moisturizer, 50ml', 449.00, 60,
  'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
  (SELECT id FROM categories WHERE name = 'Beauty'), 0, NULL),
('Classic White Sneakers', 'Minimalist leather sneakers for everyday wear', 2499.00, 30,
  'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
  (SELECT id FROM categories WHERE name = 'Footwear'), 10, '6,7,8,9,10,11'),
('Analog Wrist Watch', 'Minimalist leather-strap analog watch', 2999.00, 25,
  'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400',
  (SELECT id FROM categories WHERE name = 'Accessories'), 0, NULL);

-- No admin user is seeded. Register normally, then promote an account:
-- UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
