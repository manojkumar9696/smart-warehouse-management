const db = require('../config/db');

const Warehouse = {
  create: async (warehouseData) => {
    const { name, location } = warehouseData;
    const [result] = await db.query(
      'INSERT INTO warehouses (name, location) VALUES (?, ?)',
      [name, location || null]
    );
    return result.insertId;
  },

  findAll: async () => {
    const [rows] = await db.query('SELECT * FROM warehouses ORDER BY id DESC');
    return rows;
  },

  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM warehouses WHERE id = ?', [id]);
    return rows.length > 0 ? rows[0] : null;
  },

  update: async (id, warehouseData) => {
    const { name, location } = warehouseData;
    const [result] = await db.query(
      'UPDATE warehouses SET name = ?, location = ? WHERE id = ?',
      [name, location || null, id]
    );
    return result.affectedRows > 0;
  },

  delete: async (id) => {
    const [result] = await db.query('DELETE FROM warehouses WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = Warehouse;
