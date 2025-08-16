-- Users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user'
);

-- Products
CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY,
    title TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    image TEXT
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer TEXT NOT NULL,
    total NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    quantity INT NOT NULL
);

-- Predefined user for Anna
INSERT INTO users (email, password, role)
VALUES (
    'anna@posdemo.pl',
    -- bcrypt hash for 'test1234'
    '$2b$10$bzj9VHtKqTuah3kEqDgC4eEyqv7p0HDHS7L.UEBEZv1889YObizsi',
    'admin'
)
ON CONFLICT (email) DO NOTHING;

-- Predefined product
INSERT INTO products (id, title, price, category, description, image)
VALUES
    (1, 'Test Product', 10.99, 'Test Category', 'Test product description', 'image_url.jpg')
ON CONFLICT (id) DO NOTHING;
