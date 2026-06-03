const db = require('./db');

async function initDb() {
  try {
    console.log("Rebuilding database tables...");
    
    // Disable foreign key checks temporarily to drop/recreate table safely
    await db.query('SET FOREIGN_KEY_CHECKS = 0;');
    console.log("✓ Disabled foreign key checks.");

    // Drop old users table
    await db.query('DROP TABLE IF EXISTS users;');
    console.log("✓ Dropped old 'users' table.");

    // Create users table
    await db.query(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'manager', 'employee') NOT NULL DEFAULT 'employee',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
    console.log("✓ Re-created 'users' table with full fields.");

    // Re-enable foreign key checks
    await db.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log("✓ Re-enabled foreign key checks.");

    // Create audit_logs table (IF NOT EXISTS)
    await db.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id INT NOT NULL,
        before_value JSON,
        after_value JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);
    console.log("✓ 'audit_logs' table is verified.");

    console.log("Database initialization completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    process.exit(1);
  }
}

initDb();
