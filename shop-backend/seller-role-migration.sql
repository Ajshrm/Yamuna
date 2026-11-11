USE shop;

ALTER TABLE users
  MODIFY role ENUM('customer', 'seller', 'admin') NOT NULL DEFAULT 'customer';

UPDATE users
SET role = 'seller'
WHERE role = 'admin';
