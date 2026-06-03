const express = require('express');
const { body } = require('express-validator');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

const warehouseController = require('../controllers/warehouseController');
const categoryController = require('../controllers/categoryController');
const itemController = require('../controllers/itemController');
const inventoryController = require('../controllers/inventoryController');
const transactionController = require('../controllers/transactionController');
const aiController = require('../controllers/aiController');

const router = express.Router();

// ==========================================
// 1. WAREHOUSE ROUTES
// ==========================================
router.get(
  '/warehouses',
  verifyToken,
  warehouseController.getAllWarehouses
);

router.get(
  '/warehouses/:id',
  verifyToken,
  warehouseController.getWarehouseById
);

router.post(
  '/warehouses',
  [
    verifyToken,
    authorizeRoles('admin', 'manager'),
    body('name').trim().notEmpty().withMessage('Warehouse name is required.')
  ],
  warehouseController.createWarehouse
);

router.put(
  '/warehouses/:id',
  [
    verifyToken,
    authorizeRoles('admin', 'manager'),
    body('name').trim().notEmpty().withMessage('Warehouse name is required.')
  ],
  warehouseController.updateWarehouse
);

router.delete(
  '/warehouses/:id',
  [
    verifyToken,
    authorizeRoles('admin')
  ],
  warehouseController.deleteWarehouse
);


// ==========================================
// 2. CATEGORY ROUTES
// ==========================================
router.get(
  '/categories',
  verifyToken,
  categoryController.getAllCategories
);

router.get(
  '/categories/:id',
  verifyToken,
  categoryController.getCategoryById
);

router.post(
  '/categories',
  [
    verifyToken,
    authorizeRoles('admin', 'manager'),
    body('name').trim().notEmpty().withMessage('Category name is required.')
  ],
  categoryController.createCategory
);

router.put(
  '/categories/:id',
  [
    verifyToken,
    authorizeRoles('admin', 'manager'),
    body('name').trim().notEmpty().withMessage('Category name is required.')
  ],
  categoryController.updateCategory
);

router.delete(
  '/categories/:id',
  [
    verifyToken,
    authorizeRoles('admin', 'manager')
  ],
  categoryController.deleteCategory
);


// ==========================================
// 3. ITEM (PRODUCT) ROUTES
// ==========================================
router.get(
  '/items',
  verifyToken,
  itemController.getAllItems
);

router.get(
  '/items/:id',
  verifyToken,
  itemController.getItemById
);

router.get(
  '/items/sku/:sku',
  verifyToken,
  itemController.getItemBySku
);

router.post(
  '/items',
  [
    verifyToken,
    authorizeRoles('admin', 'manager'),
    body('name').trim().notEmpty().withMessage('Product name is required.'),
    body('sku').optional().trim(),
    body('category_id').optional().isInt().withMessage('Category ID must be an integer.'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number.')
  ],
  itemController.createItem
);

router.put(
  '/items/:id',
  [
    verifyToken,
    authorizeRoles('admin', 'manager'),
    body('name').trim().notEmpty().withMessage('Product name is required.'),
    body('sku').optional().trim(),
    body('category_id').optional().isInt().withMessage('Category ID must be an integer.'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number.')
  ],
  itemController.updateItem
);

router.delete(
  '/items/:id',
  [
    verifyToken,
    authorizeRoles('admin')
  ],
  itemController.deleteItem
);


// ==========================================
// 4. INVENTORY STOCK ROUTES
// ==========================================
router.get(
  '/inventory',
  verifyToken,
  inventoryController.getAllStock
);

router.post(
  '/inventory/placement',
  [
    verifyToken,
    authorizeRoles('admin', 'manager'),
    body('item_id').isInt().withMessage('Product ID must be an integer.'),
    body('warehouse_id').isInt().withMessage('Warehouse ID must be an integer.'),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer.'),
    body('rack').optional().trim(),
    body('shelf').optional().trim(),
    body('bin').optional().trim()
  ],
  inventoryController.updateStockPlacement
);

router.delete(
  '/inventory/placement/:id',
  [
    verifyToken,
    authorizeRoles('admin', 'manager')
  ],
  inventoryController.deleteStockPlacement
);

// ==========================================
// 5. TRANSACTION FLOW & ALERT ROUTES
// ==========================================
router.post(
  '/transactions/execute',
  [
    verifyToken,
    body('item_id').isInt().withMessage('Product ID must be an integer.'),
    body('warehouse_id').isInt().withMessage('Warehouse ID must be an integer.'),
    body('type').isIn(['inbound', 'outbound', 'transfer']).withMessage('Transaction type must be inbound, outbound, or transfer.'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer.'),
    body('notes').optional().trim(),
    body('target_warehouse_id').optional().isInt().withMessage('Target warehouse ID must be an integer.')
  ],
  transactionController.executeTransaction
);

router.get(
  '/transactions/history',
  verifyToken,
  transactionController.getTransactionHistory
);

router.get(
  '/inventory/low-stock',
  verifyToken,
  transactionController.getLowStockAlerts
);

// ==========================================
// 6. AI FORECASTING & DEEP STATISTICS ROUTES
// ==========================================
router.get(
  '/ai/forecast',
  verifyToken,
  aiController.getForecastAnalytics
);

router.post(
  '/ai/chat',
  verifyToken,
  aiController.handleAssistantChat
);

module.exports = router;
