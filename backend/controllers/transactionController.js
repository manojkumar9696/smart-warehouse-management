const Transaction = require('../models/transactionModel');
const InventoryService = require('../services/inventoryService');
const db = require('../config/db');
const { validationResult } = require('express-validator');

const transactionController = {
  executeTransaction: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { item_id, warehouse_id, type, quantity, notes, target_warehouse_id } = req.body;

      const success = await InventoryService.executeTransaction({
        itemId: parseInt(item_id),
        warehouseId: parseInt(warehouse_id),
        type,
        quantity: parseInt(quantity),
        userId: req.user ? req.user.id : null,
        notes,
        targetWarehouseId: target_warehouse_id ? parseInt(target_warehouse_id) : null
      });

      return res.status(200).json({
        success: true,
        message: `Stock ${type} transaction executed successfully.`
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Transaction execution failed.'
      });
    }
  },

  getTransactionHistory: async (req, res, next) => {
    try {
      const transactions = await Transaction.findAll();
      return res.status(200).json({
        success: true,
        data: transactions
      });
    } catch (err) {
      next(err);
    }
  },

  getLowStockAlerts: async (req, res, next) => {
    try {
      const query = `
        SELECT inventory.*, 
               items.name AS item_name, items.sku AS item_sku, items.min_threshold,
               warehouses.name AS warehouse_name
        FROM inventory
        INNER JOIN items ON inventory.item_id = items.id
        INNER JOIN warehouses ON inventory.warehouse_id = warehouses.id
        WHERE inventory.quantity < items.min_threshold
        ORDER BY inventory.quantity ASC
      `;
      const [rows] = await db.query(query);
      return res.status(200).json({
        success: true,
        data: rows
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = transactionController;
