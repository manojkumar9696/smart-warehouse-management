const Item = require('../models/itemModel');
const Category = require('../models/categoryModel');
const AuditService = require('../services/auditService');
const { validationResult } = require('express-validator');

// Helper to generate SKU elegantly
const generateSku = (itemName) => {
  const prefix = itemName
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 3)
    .toUpperCase();
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}-${rand}`;
};

const itemController = {
  createItem: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      let { name, sku, category_id, description, price } = req.body;

      // Validate Category exists if provided
      if (category_id) {
        const cat = await Category.findById(category_id);
        if (!cat) {
          return res.status(400).json({
            success: false,
            message: 'Provided category_id does not exist.'
          });
        }
      }

      // SKU Auto-generation or check
      if (!sku) {
        let isUnique = false;
        let attempts = 0;
        while (!isUnique && attempts < 5) {
          sku = generateSku(name);
          const existing = await Item.findBySku(sku);
          if (!existing) {
            isUnique = true;
          }
          attempts++;
        }
      } else {
        const existing = await Item.findBySku(sku);
        if (existing) {
          return res.status(400).json({
            success: false,
            message: 'Provided SKU already exists.'
          });
        }
      }

      const itemId = await Item.create({ name, sku, category_id, description, price });
      const newItem = { id: itemId, name, sku, category_id, description, price };

      // Audit Log
      await AuditService.log(
        req.user ? req.user.id : null,
        'ITEM_CREATE',
        'items',
        itemId,
        null,
        newItem
      );

      return res.status(201).json({
        success: true,
        message: 'Product created successfully.',
        data: newItem
      });
    } catch (err) {
      next(err);
    }
  },

  getAllItems: async (req, res, next) => {
    try {
      const { search, category_id } = req.query;
      const items = await Item.findAll({ search, category_id });
      return res.status(200).json({
        success: true,
        data: items
      });
    } catch (err) {
      next(err);
    }
  },

  getItemById: async (req, res, next) => {
    try {
      const item = await Item.findById(req.params.id);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Product not found.'
        });
      }
      return res.status(200).json({
        success: true,
        data: item
      });
    } catch (err) {
      next(err);
    }
  },

  getItemBySku: async (req, res, next) => {
    try {
      const item = await Item.findBySku(req.params.sku);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Product with this SKU not found.'
        });
      }
      return res.status(200).json({
        success: true,
        data: item
      });
    } catch (err) {
      next(err);
    }
  },

  updateItem: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const itemId = req.params.id;
      const { name, sku, category_id, description, price } = req.body;

      const oldItem = await Item.findById(itemId);
      if (!oldItem) {
        return res.status(404).json({
          success: false,
          message: 'Product not found.'
        });
      }

      // Validate Category exists if provided
      if (category_id) {
        const cat = await Category.findById(category_id);
        if (!cat) {
          return res.status(400).json({
            success: false,
            message: 'Provided category_id does not exist.'
          });
        }
      }

      // Check SKU uniqueness if changed
      if (sku && sku !== oldItem.sku) {
        const existing = await Item.findBySku(sku);
        if (existing) {
          return res.status(400).json({
            success: false,
            message: 'Provided SKU already exists.'
          });
        }
      }

      const success = await Item.update(itemId, {
        name,
        sku: sku || oldItem.sku,
        category_id,
        description,
        price
      });

      const updatedItem = {
        id: parseInt(itemId),
        name,
        sku: sku || oldItem.sku,
        category_id,
        description,
        price
      };

      if (success) {
        // Audit Log
        await AuditService.log(
          req.user ? req.user.id : null,
          'ITEM_UPDATE',
          'items',
          itemId,
          oldItem,
          updatedItem
        );
      }

      return res.status(200).json({
        success: true,
        message: 'Product updated successfully.',
        data: updatedItem
      });
    } catch (err) {
      next(err);
    }
  },

  deleteItem: async (req, res, next) => {
    try {
      const itemId = req.params.id;
      const item = await Item.findById(itemId);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Product not found.'
        });
      }

      const success = await Item.delete(itemId);

      if (success) {
        // Audit Log
        await AuditService.log(
          req.user ? req.user.id : null,
          'ITEM_DELETE',
          'items',
          itemId,
          item,
          null
        );
      }

      return res.status(200).json({
        success: true,
        message: 'Product deleted successfully.'
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = itemController;
