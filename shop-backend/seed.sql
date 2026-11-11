USE shop;

INSERT INTO products (name, description, price, category, image, stock)
SELECT seed.name, seed.description, seed.price, seed.category, seed.image, seed.stock
FROM (
  SELECT
    'Wireless Headphones' AS name,
    'Noise-cancelling wireless headphones for everyday comfort and rich sound.' AS description,
    129.99 AS price,
    'Electronics' AS category,
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80' AS image,
    20 AS stock
  UNION ALL SELECT
    'Smart Watch',
    'Track health, calls, workouts, and notifications in one sleek smartwatch.',
    199.99,
    'Electronics',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
    20
  UNION ALL SELECT
    'Classic Office Chair',
    'Ergonomic support and premium comfort for long workdays and study sessions.',
    249.00,
    'Furniture',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    20
  UNION ALL SELECT
    'Cotton T-Shirt',
    'A soft, breathable staple for casual styling and everyday wear.',
    29.99,
    'Fashion',
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
    20
  UNION ALL SELECT
    'Running Sneakers',
    'Lightweight running shoes designed for speed, comfort, and impact support.',
    139.50,
    'Fashion',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
    20
  UNION ALL SELECT
    'Coffee Maker',
    'Brew your favorite coffee with quick, convenient, and consistent results.',
    89.99,
    'Home',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80',
    20
  UNION ALL SELECT
    'Backpack Pro',
    'A durable backpack built for travel, school, and everyday carry.',
    74.50,
    'Accessories',
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80',
    20
  UNION ALL SELECT
    'Digital Camera',
    'Capture crisp photos and videos with features made for creators and travelers.',
    549.00,
    'Electronics',
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80',
    20
  UNION ALL SELECT
    'Ceramic Lamp',
    'Adds a warm glow and elegant finish to any bedroom or living room.',
    64.75,
    'Home',
    'https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=900&q=80',
    20
  UNION ALL SELECT
    'Minimal Desk Lamp',
    'Clean, modern lighting that keeps workspaces bright and stylish.',
    52.00,
    'Home',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    20
  UNION ALL SELECT
    'Graphic T-Shirt',
    'Soft cotton tee with a bold graphic print for casual everyday wear.',
    399.00,
    'Fashion',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
    20
  UNION ALL SELECT
    'Classic Polo T-Shirt',
    'Smart-casual polo with comfortable cotton fabric and a clean, versatile fit.',
    599.00,
    'Fashion',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80',
    20
) AS seed
WHERE NOT EXISTS (
  SELECT 1
  FROM products existing
  WHERE existing.name = seed.name
);
