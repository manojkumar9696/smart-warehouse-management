const db = require('../config/db');

const Category = {
  create: async (categoryData) => {
    const { name } = categoryData;
    const [result] = await db.query(
      'INSERT INTO categories (name) VALUES (?)',
      [name]
    );
    return result.insertId;
  },

  findAll: async () => {
    const [rows] = await db.query('SELECT * FROM categories ORDER BY name ASC');
    return rows;
  },

  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
    return rows.length > 0 ? rows[0] : null;
  },

  findByName: async (name) => {
    const [rows] = await db.query('SELECT * FROM categories WHERE name = ?', [name]);
    return rows.length > 0 ? rows[0] : null;
  },

  update: async (id, categoryData) => {
    const { name } = categoryData;
    const [result] = await db.query(
      'UPDATE categories SET name = ? WHERE id = ?',
      [name, id]
    );
    return result.affectedRows > 0;
  },

  delete: async (id) => {
    const [result] = await db.query('DELETE FROM categories WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = Category;
