const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

async function initDatabase() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'store_rating_db';

  console.log(`Connecting to MySQL server at ${host}:${port} as ${user}...`);

  let connection;
  try {
    // Connect without database first to create it if it doesn't exist
    connection = await mysql.createConnection({ host, port, user, password });
    console.log('Connected to MySQL server.');

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    console.log(`Database '${database}' verified/created.`);

    await connection.query(`USE \`${database}\`;`);

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(60) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        address VARCHAR(400) NOT NULL,
        role ENUM('ADMIN', 'NORMAL_USER', 'STORE_OWNER') NOT NULL DEFAULT 'NORMAL_USER',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // Create stores table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        address VARCHAR(400) NOT NULL,
        owner_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);

    // Create ratings table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ratings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        store_id INT NOT NULL,
        rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_user_store (user_id, store_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
      );
    `);

    // Create indexes safely
    const addIndexIfMissing = async (tableName, indexName, columnDef) => {
      try {
        await connection.query(`CREATE INDEX ${indexName} ON ${tableName}(${columnDef});`);
      } catch (err) {
        // Error 1061 is duplicate key name
        if (err.errno !== 1061) throw err;
      }
    };

    await addIndexIfMissing('users', 'idx_users_name', 'name');
    await addIndexIfMissing('users', 'idx_users_email', 'email');
    await addIndexIfMissing('users', 'idx_users_role', 'role');
    await addIndexIfMissing('stores', 'idx_stores_name', 'name');
    await addIndexIfMissing('stores', 'idx_stores_address', 'address');
    await addIndexIfMissing('ratings', 'idx_ratings_store', 'store_id');

    console.log('Tables and indexes created successfully.');

    // Check if default admin exists
    const [existingAdmins] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      ['admin@roxiller.com']
    );

    if (existingAdmins.length === 0) {
      console.log('Seeding initial data (Admin, Store Owners, Normal Users, Stores, Ratings)...');

      const adminPasswordHash = await bcrypt.hash('Admin@1234', 10);
      const ownerPasswordHash = await bcrypt.hash('Owner@1234', 10);
      const userPasswordHash = await bcrypt.hash('User@1234', 10);

      // Insert Admin (name >= 20 chars)
      await connection.query(
        `INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)`,
        [
          'System Administrator Roxiller',
          'admin@roxiller.com',
          adminPasswordHash,
          '742 Evergreen Terrace, Springfield Sector 12, Tech District',
          'ADMIN'
        ]
      );

      // Insert Store Owner 1
      const [ownerRes1] = await connection.query(
        `INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)`,
        [
          'Robert Downey Jr Store Owner',
          'robert.owner@stores.com',
          ownerPasswordHash,
          '10880 Malibu Point, Cliffside Way, California District 90265',
          'STORE_OWNER'
        ]
      );

      // Insert Store Owner 2
      const [ownerRes2] = await connection.query(
        `INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)`,
        [
          'Eleanor Shellstrop Store Owner',
          'eleanor.owner@stores.com',
          ownerPasswordHash,
          '404 Good Place Avenue, Neighborhood 1239, Green Valley',
          'STORE_OWNER'
        ]
      );

      // Insert Normal Users
      const [userRes1] = await connection.query(
        `INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)`,
        [
          'Alexander Hamilton Citizen',
          'alexander.user@email.com',
          userPasswordHash,
          '57 Maiden Lane, Financial District, Manhattan, NY 10038',
          'NORMAL_USER'
        ]
      );

      const [userRes2] = await connection.query(
        `INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)`,
        [
          'Hermione Jean Granger Reader',
          'hermione.user@email.com',
          userPasswordHash,
          '8 Heathgate, Hampstead Garden Suburb, London NW11 7AR',
          'NORMAL_USER'
        ]
      );

      // Insert Stores
      const [storeRes1] = await connection.query(
        `INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)`,
        [
          'SuperMart Gourmet & Groceries',
          'contact@supermartgourmet.com',
          '100 Broadway Commercial Plaza, Suite 400, New York, NY',
          ownerRes1.insertId
        ]
      );

      const [storeRes2] = await connection.query(
        `INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)`,
        [
          'Apex Electronics & Smart Gadgets',
          'support@apexelectronics.com',
          '250 Silicon Expressway, Tech Central Park, San Jose, CA',
          ownerRes2.insertId
        ]
      );

      const [storeRes3] = await connection.query(
        `INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)`,
        [
          'GreenLeaf Organic Kitchen & Cafe',
          'hello@greenleafcafe.com',
          '45 Botanical Garden Road, Eco Hub, Austin, TX 78701',
          null
        ]
      );

      // Insert Ratings
      // user1 rated store1 (5) and store2 (4)
      await connection.query(
        `INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?), (?, ?, ?)`,
        [userRes1.insertId, storeRes1.insertId, 5, userRes1.insertId, storeRes2.insertId, 4]
      );

      // user2 rated store1 (4) and store3 (5)
      await connection.query(
        `INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?), (?, ?, ?)`,
        [userRes2.insertId, storeRes1.insertId, 4, userRes2.insertId, storeRes3.insertId, 5]
      );

      console.log('Sample data seeded successfully!');
      console.log('Default credentials:');
      console.log('ADMIN: admin@roxiller.com / Admin@1234');
      console.log('STORE OWNER: robert.owner@stores.com / Owner@1234');
      console.log('NORMAL USER: alexander.user@email.com / User@1234');
    } else {
      console.log('Admin account already exists. Skipping seed.');
    }

    console.log('Database initialization completed.');
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

if (require.main === module) {
  initDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = initDatabase;
