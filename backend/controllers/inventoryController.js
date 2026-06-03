const Inventory = require('../models/inventoryModel');
const Item = require('../models/itemModel');
const Warehouse = require('../models/warehouseModel');
const AuditService = require('../services/auditService');
const { validationResult } = require('express-validator');

const inventoryController = {
  getAllStock: async (req, res, next) => {
    try {
      const { search, warehouse_id, category_id, rack, shelf, bin } = req.query;
      const stock = await Inventory.findAllStock({
        search,
        warehouse_id,
        category_id,
        rack,
        shelf,
        bin
      });
      return res.status(200).json({
        success: true,
        data: stock
      });
    } catch (err) {
      next(err);
    }
  },

  updateStockPlacement: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { item_id, warehouse_id, quantity, rack, shelf, bin } = req.body;

      // Validate Item and Warehouse exist
      const item = await Item.findById(item_id);
      if (!item) {
        return res.status(400).json({
          success: false,
          message: 'Provided product (item_id) does not exist.'
        });
      }

      const warehouse = await Warehouse.findById(warehouse_id);
      if (!warehouse) {
        return res.status(400).json({
          success: false,
          message: 'Provided warehouse (warehouse_id) does not exist.'
        });
      }

      // Check current stock for auditing
      const oldStock = await Inventory.findStock(item_id, warehouse_id);

      const stockId = await Inventory.upsertStockLocation(
        item_id,
        warehouse_id,
        quantity,
        rack,
        shelf,
        bin
      );

      const newStock = {
        id: stockId,
        item_id,
        warehouse_id,
        quantity,
        rack,
        shelf,
        bin
      };

      // Audit Log
      await AuditService.log(
        req.user ? req.user.id : null,
        'INVENTORY_UPDATE',
        'inventory',
        stockId,
        oldStock,
        newStock
      );

      return res.status(200).json({
        success: true,
        message: 'Stock placement updated successfully.',
        data: newStock
      });
    } catch (err) {
      next(err);
    }
  },

  deleteStockPlacement: async (req, res, next) => {
    try {
      const stockId = req.params.id;
      const oldStock = await Inventory.findById(stockId);
      if (!oldStock) {
        return res.status(404).json({
          success: false,
          message: 'Stock placement record not found.'
        });
      }

      const success = await Inventory.deleteStock(stockId);
      if (success) {
        // Audit Log
        await AuditService.log(
          req.user ? req.user.id : null,
          'INVENTORY_DELETE',
          'inventory',
          stockId,
          oldStock,
          null
        );
      }

      return res.status(200).json({
        success: true,
        message: 'Stock placement removed from warehouse successfully.'
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = inventoryController;
