const db = require('../config/db');

const Item = {
  create: async (itemData) => {
    const { name, sku, category_id, description, price } = itemData;
    const [result] = await db.query(
      'INSERT INTO items (name, sku, category_id, description, price) VALUES (?, ?, ?, ?, ?)',
      [name, sku, category_id || null, description || null, price || null]
    );
    return result.insertId;
  },

  findAll: async (filters = {}) => {
    let query = `
      SELECT items.*, categories.name AS category_name 
      FROM items 
      LEFT JOIN categories ON items.category_id = categories.id
    `;
    const params = [];
    const conditions = [];

    if (filters.search) {
      conditions.push('(items.name LIKE ? OR items.sku LIKE ?)');
      const searchWildcard = `%${filters.search}%`;
      params.push(searchWildcard, searchWildcard);
    }

    if (filters.category_id) {
      conditions.push('items.category_id = ?');
      params.push(filters.category_id);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY items.id DESC';

    const [rows] = await db.query(query, params);
    return rows;
  },

  findById: async (id) => {
    const query = `
      SELECT items.*, categories.name AS category_name 
      FROM items 
      LEFT JOIN categories ON items.category_id = categories.id 
      WHERE items.id = ?
    `;
    const [rows] = await db.query(query, [id]);
    return rows.length > 0 ? rows[0] : null;
  },

  findBySku: async (sku) => {
    const query = `
      SELECT items.*, categories.name AS category_name 
      FROM items 
      LEFT JOIN categories ON items.category_id = categories.id 
      WHERE items.sku = ?
    `;
    const [rows] = await db.query(query, [sku]);
    return rows.length > 0 ? rows[0] : null;
  },

  update: async (id, itemData) => {
    const { name, sku, category_id, description, price } = itemData;
    const [result] = await db.query(
      'UPDATE items SET name = ?, sku = ?, category_id = ?, description = ?, price = ? WHERE id = ?',
      [name, sku, category_id || null, description || null, price || null, id]
    );
    return result.affectedRows > 0;
  },

  delete: async (id) => {
    const [result] = await db.query('DELETE FROM items WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = Item;
