const db = require('../config/db');

const Inventory = {
  findStock: async (itemId, warehouseId) => {
    const [rows] = await db.query(
      'SELECT * FROM inventory WHERE item_id = ? AND warehouse_id = ?',
      [itemId, warehouseId]
    );
    return rows.length > 0 ? rows[0] : null;
  },

  findAllStock: async (filters = {}) => {
    let query = `
      SELECT inventory.*, 
             items.name AS item_name, items.sku AS item_sku, items.price AS item_price,
             categories.name AS category_name,
             warehouses.name AS warehouse_name, warehouses.location AS warehouse_location
      FROM inventory
      INNER JOIN items ON inventory.item_id = items.id
      INNER JOIN warehouses ON inventory.warehouse_id = warehouses.id
      LEFT JOIN categories ON items.category_id = categories.id
    `;
    const params = [];
    const conditions = [];

    if (filters.search) {
      conditions.push('(items.name LIKE ? OR items.sku LIKE ?)');
      const searchWildcard = `%${filters.search}%`;
      params.push(searchWildcard, searchWildcard);
    }

    if (filters.warehouse_id) {
      conditions.push('inventory.warehouse_id = ?');
      params.push(filters.warehouse_id);
    }

    if (filters.category_id) {
      conditions.push('items.category_id = ?');
      params.push(filters.category_id);
    }

    if (filters.rack) {
      conditions.push('inventory.rack = ?');
      params.push(filters.rack);
    }

    if (filters.shelf) {
      conditions.push('inventory.shelf = ?');
      params.push(filters.shelf);
    }

    if (filters.bin) {
      conditions.push('inventory.bin = ?');
      params.push(filters.bin);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY inventory.last_updated DESC';

    const [rows] = await db.query(query, params);
    return rows;
  },

  upsertStockLocation: async (itemId, warehouseId, quantity, rack = null, shelf = null, bin = null) => {
    // 1. Check if row exists
    const [rows] = await db.query(
      'SELECT id FROM inventory WHERE item_id = ? AND warehouse_id = ?',
      [itemId, warehouseId]
    );

    if (rows.length > 0) {
      // 2. Update existing
      const [result] = await db.query(
        'UPDATE inventory SET quantity = ?, rack = ?, shelf = ?, bin = ? WHERE id = ?',
        [quantity, rack || null, shelf || null, bin || null, rows[0].id]
      );
      return rows[0].id;
    } else {
      // 3. Create new row
      const [result] = await db.query(
        'INSERT INTO inventory (item_id, warehouse_id, quantity, rack, shelf, bin) VALUES (?, ?, ?, ?, ?, ?)',
        [itemId, warehouseId, quantity, rack || null, shelf || null, bin || null]
      );
      return result.insertId;
    }
  },

  adjustStock: async (itemId, warehouseId, adjustQty, rack = null, shelf = null, bin = null) => {
    const [rows] = await db.query(
      'SELECT id, quantity, rack, shelf, bin FROM inventory WHERE item_id = ? AND warehouse_id = ?',
      [itemId, warehouseId]
    );

    if (rows.length > 0) {
      const newQty = rows[0].quantity + adjustQty;
      // Preserve current location details if not provided
      const finalRack = rack !== null ? rack : rows[0].rack;
      const finalShelf = shelf !== null ? shelf : rows[0].shelf;
      const finalBin = bin !== null ? bin : rows[0].bin;

      await db.query(
        'UPDATE inventory SET quantity = ?, rack = ?, shelf = ?, bin = ? WHERE id = ?',
        [newQty, finalRack, finalShelf, finalBin, rows[0].id]
      );
      return rows[0].id;
    } else {
      // Create new row starting with quantity
      const [result] = await db.query(
        'INSERT INTO inventory (item_id, warehouse_id, quantity, rack, shelf, bin) VALUES (?, ?, ?, ?, ?, ?)',
        [itemId, warehouseId, adjustQty, rack, shelf, bin]
      );
      return result.insertId;
    }
  },

  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM inventory WHERE id = ?', [id]);
    return rows.length > 0 ? rows[0] : null;
  },

  deleteStock: async (id) => {
    const [result] = await db.query('DELETE FROM inventory WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = Inventory;
