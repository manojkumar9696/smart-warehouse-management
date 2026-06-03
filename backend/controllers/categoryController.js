const Category = require('../models/categoryModel');
const AuditService = require('../services/auditService');
const { validationResult } = require('express-validator');

const categoryController = {
  createCategory: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { name } = req.body;

      // Unique constraint check
      const existing = await Category.findByName(name);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists.'
        });
      }

      const categoryId = await Category.create({ name });
      const newCategory = { id: categoryId, name };

      // Audit Log
      await AuditService.log(
        req.user ? req.user.id : null,
        'CATEGORY_CREATE',
        'categories',
        categoryId,
        null,
        newCategory
      );

      return res.status(201).json({
        success: true,
        message: 'Category created successfully.',
        data: newCategory
      });
    } catch (err) {
      next(err);
    }
  },

  getAllCategories: async (req, res, next) => {
    try {
      const categories = await Category.findAll();
      return res.status(200).json({
        success: true,
        data: categories
      });
    } catch (err) {
      next(err);
    }
  },

  getCategoryById: async (req, res, next) => {
    try {
      const category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found.'
        });
      }
      return res.status(200).json({
        success: true,
        data: category
      });
    } catch (err) {
      next(err);
    }
  },

  updateCategory: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { name } = req.body;
      const categoryId = req.params.id;

      const oldCategory = await Category.findById(categoryId);
      if (!oldCategory) {
        return res.status(404).json({
          success: false,
          message: 'Category not found.'
        });
      }

      // Unique constraint check for other categories
      const existing = await Category.findByName(name);
      if (existing && existing.id !== parseInt(categoryId)) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists.'
        });
      }

      const success = await Category.update(categoryId, { name });
      const updatedCategory = { id: parseInt(categoryId), name };

      if (success) {
        // Audit Log
        await AuditService.log(
          req.user ? req.user.id : null,
          'CATEGORY_UPDATE',
          'categories',
          categoryId,
          oldCategory,
          updatedCategory
        );
      }

      return res.status(200).json({
        success: true,
        message: 'Category updated successfully.',
        data: updatedCategory
      });
    } catch (err) {
      next(err);
    }
  },

  deleteCategory: async (req, res, next) => {
    try {
      const categoryId = req.params.id;
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found.'
        });
      }

      const success = await Category.delete(categoryId);

      if (success) {
        // Audit Log
        await AuditService.log(
          req.user ? req.user.id : null,
          'CATEGORY_DELETE',
          'categories',
          categoryId,
          category,
          null
        );
      }

      return res.status(200).json({
        success: true,
        message: 'Category deleted successfully.'
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = categoryController;
