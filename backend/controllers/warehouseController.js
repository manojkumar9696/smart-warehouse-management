const Warehouse = require('../models/warehouseModel');
const AuditService = require('../services/auditService');
const { validationResult } = require('express-validator');

const warehouseController = {
  createWarehouse: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { name, location } = req.body;
      const warehouseId = await Warehouse.create({ name, location });
      const newWarehouse = { id: warehouseId, name, location };

      // Audit Log
      await AuditService.log(
        req.user ? req.user.id : null,
        'WAREHOUSE_CREATE',
        'warehouses',
        warehouseId,
        null,
        newWarehouse
      );

      return res.status(201).json({
        success: true,
        message: 'Warehouse created successfully.',
        data: newWarehouse
      });
    } catch (err) {
      next(err);
    }
  },

  getAllWarehouses: async (req, res, next) => {
    try {
      const warehouses = await Warehouse.findAll();
      return res.status(200).json({
        success: true,
        data: warehouses
      });
    } catch (err) {
      next(err);
    }
  },

  getWarehouseById: async (req, res, next) => {
    try {
      const warehouse = await Warehouse.findById(req.params.id);
      if (!warehouse) {
        return res.status(404).json({
          success: false,
          message: 'Warehouse not found.'
        });
      }
      return res.status(200).json({
        success: true,
        data: warehouse
      });
    } catch (err) {
      next(err);
    }
  },

  updateWarehouse: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { name, location } = req.body;
      const warehouseId = req.params.id;

      const oldWarehouse = await Warehouse.findById(warehouseId);
      if (!oldWarehouse) {
        return res.status(404).json({
          success: false,
          message: 'Warehouse not found.'
        });
      }

      const success = await Warehouse.update(warehouseId, { name, location });
      const updatedWarehouse = { id: parseInt(warehouseId), name, location };

      if (success) {
        // Audit Log
        await AuditService.log(
          req.user ? req.user.id : null,
          'WAREHOUSE_UPDATE',
          'warehouses',
          warehouseId,
          oldWarehouse,
          updatedWarehouse
        );
      }

      return res.status(200).json({
        success: true,
        message: 'Warehouse updated successfully.',
        data: updatedWarehouse
      });
    } catch (err) {
      next(err);
    }
  },

  deleteWarehouse: async (req, res, next) => {
    try {
      const warehouseId = req.params.id;
      const warehouse = await Warehouse.findById(warehouseId);
      if (!warehouse) {
        return res.status(404).json({
          success: false,
          message: 'Warehouse not found.'
        });
      }

      const success = await Warehouse.delete(warehouseId);

      if (success) {
        // Audit Log
        await AuditService.log(
          req.user ? req.user.id : null,
          'WAREHOUSE_DELETE',
          'warehouses',
          warehouseId,
          warehouse,
          null
        );
      }

      return res.status(200).json({
        success: true,
        message: 'Warehouse deleted successfully.'
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = warehouseController;
