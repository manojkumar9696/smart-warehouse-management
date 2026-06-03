const db = require('../config/db');

const Transaction = {
  create: async (txData) => {
    const { item_id, warehouse_id, type, quantity, user_id, notes } = txData;
    const [result] = await db.query(
      'INSERT INTO transactions (item_id, warehouse_id, type, quantity, user_id, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [item_id, warehouse_id, type, quantity, user_id || null, notes || null]
    );
    return result.insertId;
  },

  findAll: async () => {
    const query = `
      SELECT transactions.*, 
             items.name AS item_name, items.sku AS item_sku,
             warehouses.name AS warehouse_name,
             users.username AS operator_username
      FROM transactions
      INNER JOIN items ON transactions.item_id = items.id
      INNER JOIN warehouses ON transactions.warehouse_id = warehouses.id
      LEFT JOIN users ON transactions.user_id = users.id
      ORDER BY transactions.transaction_date DESC, transactions.id DESC
    `;
    const [rows] = await db.query(query);
    return rows;
  },

  findByWarehouseId: async (warehouseId) => {
    const query = `
      SELECT transactions.*, 
             items.name AS item_name, items.sku AS item_sku,
             warehouses.name AS warehouse_name,
             users.username AS operator_username
      FROM transactions
      INNER JOIN items ON transactions.item_id = items.id
      INNER JOIN warehouses ON transactions.warehouse_id = warehouses.id
      LEFT JOIN users ON transactions.user_id = users.id
      WHERE transactions.warehouse_id = ?
      ORDER BY transactions.transaction_date DESC, transactions.id DESC
    `;
    const [rows] = await db.query(query, [warehouseId]);
    return rows;
  }
};

module.exports = Transaction;
