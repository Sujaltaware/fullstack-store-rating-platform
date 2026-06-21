const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const seedData = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'store_rating_db',
  });

  try {
    console.log('Seeding database...');

    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const userPassword = await bcrypt.hash('User@1234', 10);
    const ownerPassword = await bcrypt.hash('Owner@123', 10);

    await connection.query('DELETE FROM ratings');
    await connection.query('DELETE FROM stores');
    await connection.query('DELETE FROM users');

    await connection.query(
      `INSERT INTO users (name, email, password, address, role) VALUES
       (?, ?, ?, ?, 'admin'),
       (?, ?, ?, ?, 'user'),
       (?, ?, ?, ?, 'user'),
       (?, ?, ?, ?, 'store_owner'),
       (?, ?, ?, ?, 'store_owner')`,
      [
        'System Administrator Account', 'admin@storeplatform.com', adminPassword, '100 Admin Plaza, New York, NY',
        'John Michael Anderson', 'john.anderson@email.com', userPassword, '45 Oak Street, Brooklyn, NY',
        'Sarah Elizabeth Mitchell', 'sarah.mitchell@email.com', userPassword, '78 Pine Avenue, Queens, NY',
        'Robert James Store Owner', 'robert.store@email.com', ownerPassword, '200 Market Street, Manhattan, NY',
        'Emily Grace Shop Manager', 'emily.shop@email.com', ownerPassword, '350 Broadway, Brooklyn, NY',
      ]
    );

    const [owners] = await connection.query(
      "SELECT id FROM users WHERE role = 'store_owner' ORDER BY id"
    );

    await connection.query(
      `INSERT INTO stores (name, email, address, owner_id) VALUES
       (?, ?, ?, ?),
       (?, ?, ?, ?),
       (?, ?, ?, ?)`,
      [
        'Fresh Mart Grocery', 'contact@freshmart.com', '15 Main Street, Manhattan, NY', owners[0].id,
        'Tech Hub Electronics', 'info@techhub.com', '88 Silicon Avenue, Brooklyn, NY', owners[1].id,
        'Green Leaf Cafe', 'hello@greenleaf.com', '22 Park Lane, Queens, NY', owners[0].id,
      ]
    );

    const [users] = await connection.query("SELECT id FROM users WHERE role = 'user'");
    const [stores] = await connection.query('SELECT id FROM stores');

    await connection.query(
      'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?)',
      [
        users[0].id, stores[0].id, 5,
        users[0].id, stores[1].id, 4,
        users[1].id, stores[0].id, 3,
        users[1].id, stores[2].id, 5,
      ]
    );

    console.log('Database seeded successfully!');
    console.log('\n--- Test Accounts ---');
    console.log('Admin:       admin@storeplatform.com / Admin@123');
    console.log('User:        john.anderson@email.com / User@1234');
    console.log('Store Owner: robert.store@email.com / Owner@123');
  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await connection.end();
  }
};

seedData();
