const db = require('../config/db');

const User = {
  /**
   * Create a new user in the database.
   * @param {Object} userData 
   * @param {string} userData.username
   * @param {string} userData.email
   * @param {string} userData.password (hashed)
   * @param {string} userData.role ('admin', 'manager', 'employee')
   * @returns {Promise<number>} The inserted user's ID
   */
  create: async (userData) => {
    const { username, email, password, role } = userData;
    const [result] = await db.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, password, role || 'employee']
    );
    return result.insertId;
  },

  /**
   * Find a user by email.
   * @param {string} email 
   * @returns {Promise<Object|null>} The user object or null if not found
   */
  findByEmail: async (email) => {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows.length > 0 ? rows[0] : null;
  },

  /**
   * Find a user by username.
   * @param {string} username 
   * @returns {Promise<Object|null>} The user object or null if not found
   */
  findByUsername: async (username) => {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows.length > 0 ? rows[0] : null;
  },

  /**
   * Find a user by ID (excluding password by default for safety).
   * @param {number} id 
   * @param {boolean} includePassword Whether to select the password field
   * @returns {Promise<Object|null>} The user object or null if not found
   */
  findById: async (id, includePassword = false) => {
    const fields = includePassword 
      ? '*' 
      : 'id, username, email, role, created_at, updated_at';
    const [rows] = await db.query(`SELECT ${fields} FROM users WHERE id = ?`, [id]);
    return rows.length > 0 ? rows[0] : null;
  }
};

module.exports = User;
