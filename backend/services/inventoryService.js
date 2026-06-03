const db = require('../config/db');
const EmailService = require('./emailService');
const AuditService = require('./auditService');

const InventoryService = {
  executeTransaction: async (txData) => {
    const { itemId, warehouseId, type, quantity, userId, notes, targetWarehouseId } = txData;
    
    // Validate quantity is positive
    if (quantity <= 0) {
      throw new Error('Transaction quantity must be greater than zero.');
    }

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // 1. Fetch Item details (validate existence & threshold)
      const [itemRows] = await connection.query('SELECT * FROM items WHERE id = ?', [itemId]);
      if (itemRows.length === 0) {
        throw new Error(`Product with ID ${itemId} does not exist.`);
      }
      const item = itemRows[0];

      // 2. Fetch Warehouse details
      const [whRows] = await connection.query('SELECT * FROM warehouses WHERE id = ?', [warehouseId]);
      if (whRows.length === 0) {
        throw new Error(`Warehouse with ID ${warehouseId} does not exist.`);
      }
      const warehouse = whRows[0];

      if (type === 'inbound') {
        // --- INBOUND (STOCK IN) ---
        // Upsert inventory
        const [invRows] = await connection.query(
          'SELECT id, quantity FROM inventory WHERE item_id = ? AND warehouse_id = ?',
          [itemId, warehouseId]
        );

        let currentQty = 0;
        let invId = null;

        if (invRows.length > 0) {
          invId = invRows[0].id;
          currentQty = invRows[0].quantity + quantity;
          await connection.query('UPDATE inventory SET quantity = ? WHERE id = ?', [currentQty, invId]);
        } else {
          const [insertRes] = await connection.query(
            'INSERT INTO inventory (item_id, warehouse_id, quantity) VALUES (?, ?, ?)',
            [itemId, warehouseId, quantity]
          );
          invId = insertRes.insertId;
          currentQty = quantity;
        }

        // Log Inbound Transaction
        await connection.query(
          'INSERT INTO transactions (item_id, warehouse_id, type, quantity, user_id, notes) VALUES (?, ?, ?, ?, ?, ?)',
          [itemId, warehouseId, 'inbound', quantity, userId, notes || 'Inbound stock received']
        );

        // System Audit Log
        await AuditService.log(
          userId,
          'STOCK_INBOUND',
          'inventory',
          invId,
          invRows.length > 0 ? { quantity: invRows[0].quantity } : null,
          { quantity: currentQty }
        );

      } else if (type === 'outbound') {
        // --- OUTBOUND (STOCK OUT) ---
        // Fetch inventory
        const [invRows] = await connection.query(
          'SELECT id, quantity FROM inventory WHERE item_id = ? AND warehouse_id = ?',
          [itemId, warehouseId]
        );

        if (invRows.length === 0 || invRows[0].quantity < quantity) {
          throw new Error(`Insufficient stock. Available: ${invRows.length > 0 ? invRows[0].quantity : 0}, Requested: ${quantity}`);
        }

        const invId = invRows[0].id;
        const currentQty = invRows[0].quantity - quantity;

        // Update inventory
        await connection.query('UPDATE inventory SET quantity = ? WHERE id = ?', [currentQty, invId]);

        // Log Outbound Transaction (negative qty to indicate deduction)
        await connection.query(
          'INSERT INTO transactions (item_id, warehouse_id, type, quantity, user_id, notes) VALUES (?, ?, ?, ?, ?, ?)',
          [itemId, warehouseId, 'outbound', -quantity, userId, notes || 'Outbound stock dispatched']
        );

        // System Audit Log
        await AuditService.log(
          userId,
          'STOCK_OUTBOUND',
          'inventory',
          invId,
          { quantity: invRows[0].quantity },
          { quantity: currentQty }
        );

        // Alert check: Trigger Low-Stock Alerts
        const minThreshold = item.min_threshold !== undefined ? item.min_threshold : 10;
        if (currentQty < minThreshold) {
          await EmailService.sendLowStockAlert(item, warehouse, currentQty, minThreshold);
        }

      } else if (type === 'transfer') {
        // --- TRANSFER (WAREHOUSE TO WAREHOUSE) ---
        if (!targetWarehouseId) {
          throw new Error('Destination warehouse (targetWarehouseId) is required for stock transfers.');
        }
        if (parseInt(warehouseId) === parseInt(targetWarehouseId)) {
          throw new Error('Source and destination warehouses cannot be the same.');
        }

        // Validate target warehouse exists
        const [targetWhRows] = await connection.query('SELECT * FROM warehouses WHERE id = ?', [targetWarehouseId]);
        if (targetWhRows.length === 0) {
          throw new Error(`Target warehouse with ID ${targetWarehouseId} does not exist.`);
        }
        const targetWarehouse = targetWhRows[0];

        // Deduct from source
        const [srcInvRows] = await connection.query(
          'SELECT id, quantity FROM inventory WHERE item_id = ? AND warehouse_id = ?',
          [itemId, warehouseId]
        );

        if (srcInvRows.length === 0 || srcInvRows[0].quantity < quantity) {
          throw new Error(`Insufficient stock at source warehouse. Available: ${srcInvRows.length > 0 ? srcInvRows[0].quantity : 0}, Requested: ${quantity}`);
        }

        const srcInvId = srcInvRows[0].id;
        const newSrcQty = srcInvRows[0].quantity - quantity;
        await connection.query('UPDATE inventory SET quantity = ? WHERE id = ?', [newSrcQty, srcInvId]);

        // Add to destination
        const [dstInvRows] = await connection.query(
          'SELECT id, quantity FROM inventory WHERE item_id = ? AND warehouse_id = ?',
          [itemId, targetWarehouseId]
        );

        let newDstQty = 0;
        let dstInvId = null;

        if (dstInvRows.length > 0) {
          dstInvId = dstInvRows[0].id;
          newDstQty = dstInvRows[0].quantity + quantity;
          await connection.query('UPDATE inventory SET quantity = ? WHERE id = ?', [newDstQty, dstInvId]);
        } else {
          const [dstInsertRes] = await connection.query(
            'INSERT INTO inventory (item_id, warehouse_id, quantity) VALUES (?, ?, ?)',
            [itemId, targetWarehouseId, quantity]
          );
          dstInvId = dstInsertRes.insertId;
          newDstQty = quantity;
        }

        // Log double transaction records (Transfer-Out from source, Transfer-In to target)
        await connection.query(
          'INSERT INTO transactions (item_id, warehouse_id, type, quantity, user_id, notes) VALUES (?, ?, ?, ?, ?, ?)',
          [itemId, warehouseId, 'transfer', -quantity, userId, notes || `Transfer outbound to ${targetWarehouse.name}`]
        );

        await connection.query(
          'INSERT INTO transactions (item_id, warehouse_id, type, quantity, user_id, notes) VALUES (?, ?, ?, ?, ?, ?)',
          [itemId, targetWarehouseId, 'transfer', quantity, userId, notes || `Transfer inbound from ${warehouse.name}`]
        );

        // System Audit Logs
        await AuditService.log(
          userId,
          'STOCK_TRANSFER_OUT',
          'inventory',
          srcInvId,
          { quantity: srcInvRows[0].quantity },
          { quantity: newSrcQty }
        );

        await AuditService.log(
          userId,
          'STOCK_TRANSFER_IN',
          'inventory',
          dstInvId,
          dstInvRows.length > 0 ? { quantity: dstInvRows[0].quantity } : null,
          { quantity: newDstQty }
        );

        // Alert check on source warehouse
        const minThreshold = item.min_threshold !== undefined ? item.min_threshold : 10;
        if (newSrcQty < minThreshold) {
          await EmailService.sendLowStockAlert(item, warehouse, newSrcQty, minThreshold);
        }

      } else {
        throw new Error(`Unsupported transaction type: ${type}`);
      }

      await connection.commit();
      return true;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }
};

module.exports = InventoryService;
