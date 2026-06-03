import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import {
  LogOut,
  User,
  Mail,
  Shield,
  Box,
  BarChart3,
  Database,
  Bell,
  Search,
  Plus,
  Trash2,
  Edit,
  MapPin,
  Tag,
  Boxes,
  Loader2,
  RefreshCw,
  FolderOpen,
  ArrowRightLeft,
  AlertTriangle,
  History,
  TrendingDown,
  Info,
  Sparkles,
  TrendingUp,
  Cpu,
  MessageSquare,
  QrCode,
  Scan
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);

  // Layout Tab Switching
  const [activeMenu, setActiveMenu] = useState('dashboard'); // 'dashboard', 'inventory_panel', 'alerts_panel'
  const [activeSubTab, setActiveSubTab] = useState('products'); // 'products', 'warehouses', 'categories', 'placements', 'ledger', 'adjust'

  // Data State Arrays
  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [forecasts, setForecasts] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [selectedForecastItem, setSelectedForecastItem] = useState('');
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'assistant', text: 'Hello! I am your SmartWarehouse AI Manager Assistant. Ask me about current stock metrics, low stock warnings, reorder recommendations, or transaction logs!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scannerValue, setScannerValue] = useState('');

  // Loading States
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [txTypeFilter, setTxTypeFilter] = useState('');

  // Status Alerts
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modal / Form States
  const [showItemForm, setShowItemForm] = useState(false);
  const [showWarehouseForm, setShowWarehouseForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showPlacementForm, setShowPlacementForm] = useState(false);

  // Form Fields State
  const [itemForm, setItemForm] = useState({ id: null, name: '', sku: '', category_id: '', description: '', price: '', min_threshold: 10 });
  const [warehouseForm, setWarehouseForm] = useState({ id: null, name: '', location: '' });
  const [categoryForm, setCategoryForm] = useState({ id: null, name: '' });
  const [placementForm, setPlacementForm] = useState({ item_id: '', warehouse_id: '', quantity: '', rack: '', shelf: '', bin: '' });
  const [adjustForm, setAdjustForm] = useState({ item_id: '', warehouse_id: '', type: 'inbound', quantity: '', target_warehouse_id: '', notes: '' });

  // Fetching Helpers
  const fetchData = async () => {
    setIsLoadingData(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const [itemsRes, whRes, catRes, stockRes, txRes, alertsRes] = await Promise.all([
        api.get('/items'),
        api.get('/warehouses'),
        api.get('/categories'),
        api.get('/inventory'),
        api.get('/transactions/history'),
        api.get('/inventory/low-stock')
      ]);

      setItems(itemsRes.data.data || []);
      setWarehouses(whRes.data.data || []);
      setCategories(catRes.data.data || []);
      setInventory(stockRes.data.data || []);
      setTransactions(txRes.data.data || []);
      setLowStockAlerts(alertsRes.data.data || []);

      // Fetch AI forecasting safely
      try {
        const aiRes = await api.get('/ai/forecast');
        if (aiRes.data?.success && aiRes.data?.data) {
          const fetchedForecasts = aiRes.data.data.forecasts || [];
          setForecasts(fetchedForecasts);
          setAnomalies(aiRes.data.data.anomalies || []);
          if (fetchedForecasts.length > 0) {
            setSelectedForecastItem(prev => prev || fetchedForecasts[0].id.toString());
          }
        }
      } catch (aiErr) {
        console.warn('AI Forecasting modules syncing issues:', aiErr);
      }
    } catch (err) {
      console.error('Failed to retrieve inventory data:', err);
      setErrorMsg('Failed to sync warehouse assets. Please check backend.');
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, []);



  const clearAlerts = () => {
    setTimeout(() => {
      setSuccessMsg('');
      setErrorMsg('');
    }, 4000);
  };

  // ==========================================
  // PRODUCT (ITEM) ACTIONS
  // ==========================================
  const handleItemSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const payload = {
        name: itemForm.name,
        sku: itemForm.sku || undefined,
        category_id: itemForm.category_id ? parseInt(itemForm.category_id) : null,
        description: itemForm.description,
        price: itemForm.price ? parseFloat(itemForm.price) : null,
        min_threshold: itemForm.min_threshold ? parseInt(itemForm.min_threshold) : 10
      };

      if (itemForm.id) {
        // Edit Item
        const res = await api.put(`/items/${itemForm.id}`, payload);
        if (res.data.success) {
          setSuccessMsg('Product updated successfully.');
          setShowItemForm(false);
          setItemForm({ id: null, name: '', sku: '', category_id: '', description: '', price: '', min_threshold: 10 });
          fetchData();
        }
      } else {
        // Create Item
        const res = await api.post('/items', payload);
        if (res.data.success) {
          setSuccessMsg('Product created successfully.');
          setShowItemForm(false);
          setItemForm({ id: null, name: '', sku: '', category_id: '', description: '', price: '', min_threshold: 10 });
          fetchData();
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Product operation failed.');
    } finally {
      setIsSubmitting(false);
      clearAlerts();
    }
  };

  const handleEditItem = (item) => {
    setItemForm({
      id: item.id,
      name: item.name,
      sku: item.sku,
      category_id: item.category_id || '',
      description: item.description || '',
      price: item.price || '',
      min_threshold: item.min_threshold || 10
    });
    setShowItemForm(true);
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await api.delete(`/items/${id}`);
      if (res.data.success) {
        setSuccessMsg('Product removed successfully.');
        fetchData();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to remove product.');
    } finally {
      clearAlerts();
    }
  };

  // ==========================================
  // WAREHOUSE ACTIONS
  // ==========================================
  const handleWarehouseSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const payload = { name: warehouseForm.name, location: warehouseForm.location };
      if (warehouseForm.id) {
        const res = await api.put(`/warehouses/${warehouseForm.id}`, payload);
        if (res.data.success) {
          setSuccessMsg('Warehouse updated successfully.');
          setShowWarehouseForm(false);
          setWarehouseForm({ id: null, name: '', location: '' });
          fetchData();
        }
      } else {
        const res = await api.post('/warehouses', payload);
        if (res.data.success) {
          setSuccessMsg('Warehouse registered successfully.');
          setShowWarehouseForm(false);
          setWarehouseForm({ id: null, name: '', location: '' });
          fetchData();
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Warehouse operation failed.');
    } finally {
      setIsSubmitting(false);
      clearAlerts();
    }
  };

  const handleEditWarehouse = (wh) => {
    setWarehouseForm({ id: wh.id, name: wh.name, location: wh.location || '' });
    setShowWarehouseForm(true);
  };

  const handleDeleteWarehouse = async (id) => {
    if (!window.confirm('Are you sure you want to delete this warehouse?')) return;
    try {
      const res = await api.delete(`/warehouses/${id}`);
      if (res.data.success) {
        setSuccessMsg('Warehouse removed successfully.');
        fetchData();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to remove warehouse.');
    } finally {
      clearAlerts();
    }
  };

  // ==========================================
  // CATEGORY ACTIONS
  // ==========================================
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const payload = { name: categoryForm.name };
      if (categoryForm.id) {
        const res = await api.put(`/categories/${categoryForm.id}`, payload);
        if (res.data.success) {
          setSuccessMsg('Category updated.');
          setShowCategoryForm(false);
          setCategoryForm({ id: null, name: '' });
          fetchData();
        }
      } else {
        const res = await api.post('/categories', payload);
        if (res.data.success) {
          setSuccessMsg('Category created.');
          setShowCategoryForm(false);
          setCategoryForm({ id: null, name: '' });
          fetchData();
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Category operation failed.');
    } finally {
      setIsSubmitting(false);
      clearAlerts();
    }
  };

  const handleEditCategory = (cat) => {
    setCategoryForm({ id: cat.id, name: cat.name });
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await api.delete(`/categories/${id}`);
      if (res.data.success) {
        setSuccessMsg('Category removed successfully.');
        fetchData();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to remove category.');
    } finally {
      clearAlerts();
    }
  };

  // ==========================================
  // STOCK PLACEMENT & INVENTORY FLOW
  // ==========================================
  const handlePlacementSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const payload = {
        item_id: parseInt(placementForm.item_id),
        warehouse_id: parseInt(placementForm.warehouse_id),
        quantity: parseInt(placementForm.quantity),
        rack: placementForm.rack || null,
        shelf: placementForm.shelf || null,
        bin: placementForm.bin || null
      };

      const res = await api.post('/inventory/placement', payload);
      if (res.data.success) {
        setSuccessMsg('Stock location placement allocated successfully.');
        setShowPlacementForm(false);
        setPlacementForm({ item_id: '', warehouse_id: '', quantity: '', rack: '', shelf: '', bin: '' });
        fetchData();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Stock allocation failed.');
    } finally {
      setIsSubmitting(false);
      clearAlerts();
    }
  };

  const handleEditPlacement = (stock) => {
    setPlacementForm({
      item_id: stock.item_id.toString(),
      warehouse_id: stock.warehouse_id.toString(),
      quantity: stock.quantity.toString(),
      rack: stock.rack || '',
      shelf: stock.shelf || '',
      bin: stock.bin || ''
    });
    setShowPlacementForm(true);
  };

  const handleDeletePlacement = async (id) => {
    if (!window.confirm('Are you sure you want to remove this stock placement from the warehouse?')) return;
    try {
      const res = await api.delete(`/inventory/placement/${id}`);
      if (res.data.success) {
        setSuccessMsg('Stock placement removed successfully.');
        fetchData();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to remove stock placement.');
    } finally {
      clearAlerts();
    }
  };

  const handleStockFlowSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const payload = {
        item_id: parseInt(adjustForm.item_id),
        warehouse_id: parseInt(adjustForm.warehouse_id),
        type: adjustForm.type,
        quantity: parseInt(adjustForm.quantity),
        notes: adjustForm.notes,
        target_warehouse_id: adjustForm.type === 'transfer' ? parseInt(adjustForm.target_warehouse_id) : undefined
      };

      const res = await api.post('/transactions/execute', payload);
      if (res.data.success) {
        setSuccessMsg(`Stock ${adjustForm.type} completed successfully.`);
        setAdjustForm({ item_id: '', warehouse_id: '', type: 'inbound', quantity: '', target_warehouse_id: '', notes: '' });
        fetchData();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Stock adjustment rejected.');
    } finally {
      setIsSubmitting(false);
      clearAlerts();
    }
  };

  const handleTriggerQuickRestock = (stock) => {
    setAdjustForm({
      item_id: stock.item_id.toString(),
      warehouse_id: stock.warehouse_id.toString(),
      type: 'inbound',
      quantity: '100',
      target_warehouse_id: '',
      notes: 'Quick replenishment restocking'
    });
    setActiveMenu('inventory_panel');
    setActiveSubTab('adjust');
  };

  const handleTriggerAIProcure = (itemId, quantity) => {
    const existingStock = inventory.find(stock => stock.item_id === itemId);
    const defaultWarehouseId = existingStock ? existingStock.warehouse_id : (warehouses[0]?.id || '');

    setAdjustForm({
      item_id: itemId.toString(),
      warehouse_id: defaultWarehouseId.toString(),
      type: 'inbound',
      quantity: quantity.toString(),
      target_warehouse_id: '',
      notes: 'AI Automated Procure Order Restock'
    });
    setActiveMenu('inventory_panel');
    setActiveSubTab('adjust');
  };

  const getMonthlyDataPoints = (forecast) => {
    if (!forecast) return [];
    const baseDemand = forecast.predicted_demand || 100;
    const monthsList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    let multipliers = [0.95, 0.90, 0.95, 1.00, 1.05, 1.00, 0.95, 1.00, 1.00, 1.05, 1.10, 1.25];
    if (forecast.seasonal_factor === 1.45) {
      multipliers = [0.85, 0.90, 0.95, 1.10, 1.40, 1.55, 1.60, 1.45, 1.15, 0.95, 0.85, 0.90];
    } else if (forecast.seasonal_factor === 1.30) {
      multipliers = [1.10, 0.90, 0.85, 0.80, 0.85, 0.90, 0.95, 0.95, 1.05, 1.15, 1.35, 1.50];
    }
    
    return multipliers.map((mult, idx) => {
      return {
        month: monthsList[idx],
        value: Math.ceil(baseDemand * (mult / forecast.seasonal_factor))
      };
    });
  };

  const handleSendChat = async (e, customQuery = null) => {
    if (e) e.preventDefault();
    const query = customQuery || chatInput;
    if (!query.trim() || isSendingChat) return;

    const newMsg = { sender: 'user', text: query };
    const updatedMessages = [...chatMessages, newMsg];
    setChatMessages(updatedMessages);
    setChatInput('');
    setIsSendingChat(true);

    try {
      const historyContext = chatMessages.slice(-8).map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await api.post('/ai/chat', {
        message: query,
        history: historyContext
      });

      if (res.data.success) {
        setChatMessages(prev => [...prev, { sender: 'assistant', text: res.data.reply }]);
      }
    } catch (err) {
      console.error('AI Chat Error:', err);
      setChatMessages(prev => [...prev, { sender: 'assistant', text: '⚠️ Failed to connect to AI Manager assistant. Please verify backend connectivity.' }]);
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleExportExcel = () => {
    const headers = [
      'Product SKU',
      'Product Title',
      'Category Group',
      'Current Inventory Balance',
      'Daily Velocity (units/day)',
      'Optimal Reorder Point (ROP)',
      'Seasonal Demand Factor',
      'Predicted 30-Day Demand',
      'AI Restock Recommendation',
      'Status Flag'
    ];

    const rows = forecasts.map(f => [
      `"${f.sku}"`,
      `"${f.name.replace(/"/g, '""')}"`,
      `"${f.category}"`,
      f.current_stock,
      f.daily_velocity,
      f.reorder_point,
      `"${f.seasonal_factor.toFixed(2)}x"`,
      f.predicted_demand,
      f.recommendation,
      `"${f.status}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SmartWarehouse_AI_Replenishment_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSuccessMsg('Excel procurement report exported successfully!');
    clearAlerts();
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setErrorMsg('Pop-up blocked. Please allow popups to export PDFs.');
      clearAlerts();
      return;
    }

    const tableRowsHtml = forecasts.map(f => `
      <tr style="${f.status === 'RESTOCK_RECOMMENDED' ? 'background-color: rgba(170, 59, 255, 0.04);' : ''}">
        <td style="padding: 10px; border-bottom: 1px solid #e5e4e7; font-family: ui-monospace, monospace;">${f.sku}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e4e7; font-weight: 600;">${f.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e4e7;">${f.category}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e4e7; text-align: right; font-weight: bold; ${f.status === 'RESTOCK_RECOMMENDED' ? 'color: #ef4444;' : ''}">${f.current_stock}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e4e7; text-align: right;">${f.daily_velocity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e4e7; text-align: right;">${f.reorder_point}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e4e7; text-align: right;">${f.seasonal_factor.toFixed(2)}x</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e4e7; text-align: right; font-weight: bold;">${f.predicted_demand}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e4e7; text-align: center;">
          <span style="display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; ${
            f.status === 'RESTOCK_RECOMMENDED'
              ? 'background-color: rgba(170, 59, 255, 0.1); color: #aa3bff;'
              : 'background-color: rgba(34, 197, 94, 0.1); color: #22c55e;'
          }">
            ${f.status === 'RESTOCK_RECOMMENDED' ? `ORDER +${f.recommendation}` : 'SAFE'}
          </span>
        </td>
      </tr>
    `).join('');

    const anomaliesRowsHtml = anomalies.map(a => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e4e7; font-family: ui-monospace, monospace;">${a.item_sku}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e4e7; font-weight: 600;">${a.item_name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e4e7; text-align: right; font-weight: bold; color: #ef4444;">${a.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e4e7; text-align: right;">${a.avg_size}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e4e7; text-align: right; color: #ef4444; font-weight: bold;">${a.deviation.toFixed(1)}σ</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e4e7; text-align: right;">${new Date(a.transaction_date).toLocaleDateString()}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>SmartWarehouse AI Procurement & Stock Forecast Report</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; color: #332d3a; margin: 40px; }
            .header-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #aa3bff; }
            .report-title { font-size: 20px; font-weight: bold; text-align: right; color: #08060d; }
            .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px; color: #6b6375; }
            .meta-table td { padding: 4px 0; }
            h2 { font-size: 16px; border-bottom: 2px solid #aa3bff; padding-bottom: 6px; color: #08060d; margin-top: 30px; }
            table.data-table { width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; }
            table.data-table th { background-color: #f4f3ec; padding: 10px; font-weight: bold; color: #08060d; border-bottom: 2px solid #e5e4e7; }
            .footer { margin-top: 40px; font-size: 11px; text-align: center; color: #a19ba8; border-top: 1px solid #e5e4e7; padding-top: 15px; }
            @media print {
              body { margin: 20px; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td class="logo">SmartWarehouse AI</td>
              <td class="report-title">EXECUTIVE FORECAST & REPLENISHMENT REPORT</td>
            </tr>
          </table>

          <table class="meta-table">
            <tr>
              <td style="width: 50%;"><strong>Generated By:</strong> ${user?.username || 'System'} (Role: ${(user?.role || 'manager').toUpperCase()})</td>
              <td style="text-align: right; width: 50%;"><strong>Report Date:</strong> ${new Date().toLocaleString()}</td>
            </tr>
            <tr>
              <td><strong>Status:</strong> LIVE DATABASE SYNCHRONIZED</td>
              <td style="text-align: right;"><strong>Total SKUs Audited:</strong> ${forecasts.length}</td>
            </tr>
          </table>

          <h2>AI PROCUREMENT & SAFETY THRESHOLDS SUGGESTIONS</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product Title</th>
                <th>Category</th>
                <th style="text-align: right;">Stock</th>
                <th style="text-align: right;">Velocity/d</th>
                <th style="text-align: right;">Reorder Point</th>
                <th style="text-align: right;">Seasonal</th>
                <th style="text-align: right;">Monthly Demand</th>
                <th style="text-align: center;">AI Recommendation</th>
              </tr>
            </thead>
            <tbody>
              ${tableRowsHtml}
            </tbody>
          </table>

          ${anomalies.length > 0 ? `
            <h2>FLAGGED STATISTICAL TRANSACTION ANOMALIES</h2>
            <table class="data-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product Title</th>
                  <th style="text-align: right;">Spike Quantity</th>
                  <th style="text-align: right;">Historical Avg</th>
                  <th style="text-align: right;">Deviation</th>
                  <th style="text-align: right;">Spike Date</th>
                </tr>
              </thead>
              <tbody>
                ${anomaliesRowsHtml}
              </tbody>
            </table>
          ` : ''}

          <div class="footer">
            SmartWarehouse Intelligent Replenishment Engine • Vector Cryptographic Audit Trail • Powered by Antigravity AI
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    setSuccessMsg('Executive PDF report prepared and printed successfully!');
    clearAlerts();
  };

  const handleConfirmScan = (e) => {
    if (e) e.preventDefault();
    if (!scannerValue) return;

    setAdjustForm(prev => ({
      ...prev,
      item_id: scannerValue
    }));

    setShowScanner(false);
    setSuccessMsg('Barcode scanned and SKU selected successfully!');
    clearAlerts();
  };
  // Role Color Logic helper
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return { bg: 'rgba(170, 59, 255, 0.15)', text: 'var(--accent)', border: 'rgba(170, 59, 255, 0.4)' };
      case 'manager':
        return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.4)' };
      default:
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', border: 'rgba(16, 185, 129, 0.4)' };
    }
  };

  const badgeStyle = user ? getRoleBadgeColor(user.role) : {};

  // Check RBAC permissions for modifications
  const isWritable = user?.role === 'admin' || user?.role === 'manager';
  const isAdmin = user?.role === 'admin';

  // Filters logic
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter ? item.category_id === parseInt(categoryFilter) : true;
    return matchesSearch && matchesCategory;
  });

  const filteredStock = inventory.filter(stock => {
    const matchesSearch = stock.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         stock.item_sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWarehouse = warehouseFilter ? stock.warehouse_id === parseInt(warehouseFilter) : true;
    const matchesCategory = categoryFilter ? stock.category_id === parseInt(categoryFilter) : true;
    return matchesSearch && matchesWarehouse && matchesCategory;
  });

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tx.item_sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = txTypeFilter ? tx.type === txTypeFilter : true;
    return matchesSearch && matchesType;
  });

  return (
    <div style={styles.container}>
      {/* Sidebar Navigation */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logoWrapper}>
            <span style={styles.logoText}>SW</span>
          </div>
          <span style={styles.brandName}>SmartWarehouse</span>
        </div>

        <nav style={styles.nav}>
          <button
            onClick={() => setActiveMenu('dashboard')}
            style={activeMenu === 'dashboard' ? { ...styles.navItem, ...styles.activeNavItem } : styles.navItem}
          >
            <Database size={18} />
            <span>Dashboard Portal</span>
          </button>

          <button
            onClick={() => setActiveMenu('inventory_panel')}
            style={activeMenu === 'inventory_panel' ? { ...styles.navItem, ...styles.activeNavItem } : styles.navItem}
          >
            <Boxes size={18} />
            <span>Products & Warehouses</span>
          </button>

          <button
            onClick={() => setActiveMenu('alerts_panel')}
            style={activeMenu === 'alerts_panel' ? { ...styles.navItem, ...styles.activeNavItem } : styles.navItem}
          >
            <Bell size={18} />
            <span>System Alerts</span>
            {lowStockAlerts.length > 0 && (
              <span style={styles.alertCountIcon}>{lowStockAlerts.length}</span>
            )}
          </button>

          <button
            onClick={() => setActiveMenu('ai_forecast')}
            style={activeMenu === 'ai_forecast' ? { ...styles.navItem, ...styles.activeNavItem } : styles.navItem}
          >
            <BarChart3 size={18} />
            <span>AI Demand Forecast</span>
          </button>

          <button
            onClick={() => setActiveMenu('ai_chat')}
            style={activeMenu === 'ai_chat' ? { ...styles.navItem, ...styles.activeNavItem } : styles.navItem}
          >
            <MessageSquare size={18} />
            <span>AI Manager Assistant</span>
          </button>
        </nav>

        <div style={styles.sidebarFooter}>
          <button onClick={logout} style={styles.logoutBtn}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main dashboard content container */}
      <main style={styles.main}>
        {/* Top Header section */}
        <header style={styles.header}>
          <div style={styles.welcomeSection}>
            <h1 style={styles.welcomeTitle}>
              {activeMenu === 'dashboard' && `Welcome Back, ${user?.username}!`}
              {activeMenu === 'inventory_panel' && 'Products & Rack Inventory'}
              {activeMenu === 'alerts_panel' && 'System Alarms & Notifications'}
              {activeMenu === 'ai_forecast' && 'AI Predictive Demand Forecast'}
              {activeMenu === 'ai_chat' && 'AI Manager Assistant Console'}
            </h1>
            <p style={styles.welcomeSub}>
              {activeMenu === 'dashboard' && 'Here is your system dashboard overview.'}
              {activeMenu === 'inventory_panel' && 'Manage product catalogs, warehouses, category groups, and precise rack/shelf locations.'}
              {activeMenu === 'alerts_panel' && 'Real-time list of products dropping below min stock values. Procurement suggested.'}
              {activeMenu === 'ai_forecast' && 'Predictive seasonal sales multipliers, safety reorder thresholds, and statistical anomaly detection.'}
              {activeMenu === 'ai_chat' && 'Natural language warehouse queries, instant depletion audits, and reorder point procurement summaries.'}
            </p>
          </div>

          <div style={styles.rightHeaderControls}>
            <button onClick={fetchData} style={styles.syncBtn} title="Sync Assets">
              <RefreshCw size={16} className={isLoadingData ? 'spinning' : ''} />
            </button>

            <div style={styles.userInfoCard}>
              <div style={styles.userInfoItem}>
                <User size={16} style={styles.infoIcon} />
                <span style={styles.infoText}>{user?.username}</span>
              </div>
              <span style={{
                ...styles.roleBadge,
                background: badgeStyle.bg,
                color: badgeStyle.text,
                border: `1px solid ${badgeStyle.border}`
              }}>
                {user?.role?.toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Alerts */}
        {successMsg && (
          <div style={styles.successAlert}>
            <p style={styles.successText}>{successMsg}</p>
          </div>
        )}
        {errorMsg && (
          <div style={styles.errorAlert}>
            <p style={styles.errorText}>{errorMsg}</p>
          </div>
        )}

        {/* SCREEN 1: PORTAL DASHBOARD OVERVIEW */}
        {activeMenu === 'dashboard' && (
          <>
            {/* KPI Cards Grid */}
            <section style={styles.kpiGrid}>
              <div style={styles.kpiCard}>
                <div style={styles.kpiHeader}>
                  <span style={styles.kpiTitle}>Warehouse Hubs</span>
                  <MapPin size={20} style={{ color: 'var(--accent)' }} />
                </div>
                <div style={styles.kpiValue}>{warehouses.length}</div>
                <p style={styles.kpiFooter}>Active physical inventory centers</p>
              </div>

              <div style={styles.kpiCard}>
                <div style={styles.kpiHeader}>
                  <span style={styles.kpiTitle}>Product Catalog</span>
                  <Box size={20} style={{ color: '#3b82f6' }} />
                </div>
                <div style={styles.kpiValue}>{items.length}</div>
                <p style={styles.kpiFooter}>Registered unique SKUs</p>
              </div>

              <div style={styles.kpiCard}>
                <div style={styles.kpiHeader}>
                  <span style={styles.kpiTitle}>Low Stock Warnings</span>
                  <AlertTriangle size={20} style={lowStockAlerts.length > 0 ? { color: '#ef4444' } : { color: 'var(--text)' }} />
                </div>
                <div style={styles.kpiValue}>{lowStockAlerts.length}</div>
                <p style={styles.kpiFooter}>SKUs currently under safety margins</p>
              </div>

              <div style={styles.kpiCard}>
                <div style={styles.kpiHeader}>
                  <span style={styles.kpiTitle}>Transactions Audited</span>
                  <History size={20} style={{ color: '#f59e0b' }} />
                </div>
                <div style={styles.kpiValue}>{transactions.length}</div>
                <p style={styles.kpiFooter}>Total audited stock movements</p>
              </div>
            </section>

            {/* Dashboard Grid Modules */}
            <section style={styles.grid}>
              <div style={styles.profileCard}>
                <h3 style={styles.cardTitle}>Profile Information</h3>
                <div style={styles.profileDetailList}>
                  <div style={styles.detailRow}>
                    <div style={styles.detailLabel}>
                      <User size={16} />
                      <span>Username</span>
                    </div>
                    <div style={styles.detailVal}>{user?.username}</div>
                  </div>
                  <div style={styles.detailRow}>
                    <div style={styles.detailLabel}>
                      <Mail size={16} />
                      <span>Email Address</span>
                    </div>
                    <div style={styles.detailVal}>{user?.email}</div>
                  </div>
                  <div style={styles.detailRow}>
                    <div style={styles.detailLabel}>
                      <Shield size={16} />
                      <span>Security Role</span>
                    </div>
                    <div style={styles.detailVal}><span style={{ textTransform: 'capitalize' }}>{user?.role}</span></div>
                  </div>
                  <div style={styles.detailRow}>
                    <div style={styles.detailLabel}>
                      <Database size={16} />
                      <span>User Record ID</span>
                    </div>
                    <div style={styles.detailVal}>{user?.id}</div>
                  </div>
                </div>
              </div>

              <div style={styles.statusCard}>
                <h3 style={styles.cardTitle}>Authentication Status</h3>
                <div style={styles.statusContent}>
                  <div style={styles.statusBadge}>
                    <div style={styles.pulseDot}></div>
                    <span>Session Active (24h JWT Verified)</span>
                  </div>
                  <p style={styles.statusDesc}>
                    Your role permissions grant you access to transactional ledger dispatches. Every stock movement triggers security audit logs automatically.
                  </p>
                  <div style={styles.auditLogNotice}>
                    <strong>Security Log Action:</strong> USER_LOGIN was recorded under user_id: {user?.id}
                  </div>
                </div>
              </div>
            </section>

            {/* Core Services Staging Timeline */}
            <section style={styles.stagingBanner}>
              <h3 style={styles.stagingTitle}>Core Services Staging Status</h3>
              <div style={styles.timeline}>
                <div style={{ ...styles.timelineNode, ...styles.nodeDone }}>
                  <div style={styles.nodePoint}>✓</div>
                  <div style={styles.nodeContent}>
                    <h4 style={styles.nodeTitle}>Phase 1: Core Auth</h4>
                    <p style={styles.nodeDesc}>Authentication, security middlewares, and role authorization is active.</p>
                  </div>
                </div>
                <div style={{ ...styles.timelineNode, ...styles.nodeDone }}>
                  <div style={styles.nodePoint}>✓</div>
                  <div style={styles.nodeContent}>
                    <h4 style={styles.nodeTitle}>Phase 2: Product & Rack Inventory</h4>
                    <p style={styles.nodeDesc}>Product Catalog management, SKU listings, and Rack/Shelf/Bin configuration tools.</p>
                  </div>
                </div>
                <div style={{ ...styles.timelineNode, ...styles.nodeDone }}>
                  <div style={styles.nodePoint}>✓</div>
                  <div style={styles.nodeContent}>
                    <h4 style={styles.nodeTitle}>Phase 3: Inventory Flow & Alerts</h4>
                    <p style={styles.nodeDesc}>Inbound/Outbound transactions, transfer logging, stock tracking, and low-level alerts.</p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* SCREEN 2: INVENTORY & WAREHOUSE CONTROL PANEL */}
        {activeMenu === 'inventory_panel' && (
          <div style={styles.panelContainer}>
            {/* Tab switcher header */}
            <div style={styles.panelTabs}>
              <button
                onClick={() => { setActiveSubTab('products'); setSuccessMsg(''); setErrorMsg(''); }}
                style={activeSubTab === 'products' ? styles.activeTabButton : styles.tabButton}
              >
                <Box size={16} />
                <span>Products Catalog</span>
              </button>
              <button
                onClick={() => { setActiveSubTab('warehouses'); setSuccessMsg(''); setErrorMsg(''); }}
                style={activeSubTab === 'warehouses' ? styles.activeTabButton : styles.tabButton}
              >
                <MapPin size={16} />
                <span>Warehouses</span>
              </button>
              <button
                onClick={() => { setActiveSubTab('categories'); setSuccessMsg(''); setErrorMsg(''); }}
                style={activeSubTab === 'categories' ? styles.activeTabButton : styles.tabButton}
              >
                <Tag size={16} />
                <span>Categories</span>
              </button>
              <button
                onClick={() => { setActiveSubTab('placements'); setSuccessMsg(''); setErrorMsg(''); }}
                style={activeSubTab === 'placements' ? styles.activeTabButton : styles.tabButton}
              >
                <Boxes size={16} />
                <span>Stock Placements</span>
              </button>
              <button
                onClick={() => { setActiveSubTab('adjust'); setSuccessMsg(''); setErrorMsg(''); }}
                style={activeSubTab === 'adjust' ? styles.activeTabButton : styles.tabButton}
              >
                <ArrowRightLeft size={16} />
                <span>Stock Adjuster</span>
              </button>
              <button
                onClick={() => { setActiveSubTab('ledger'); setSuccessMsg(''); setErrorMsg(''); }}
                style={activeSubTab === 'ledger' ? styles.activeTabButton : styles.tabButton}
              >
                <History size={16} />
                <span>Ledger Trail</span>
              </button>
            </div>

            {/* Filter Deck */}
            <div style={styles.filterDeck}>
              <div style={styles.searchWrapper}>
                <Search size={18} style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder={
                    activeSubTab === 'ledger' ? "Search ledger by product name or SKU..." : "Search products by title or SKU..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={styles.searchInput}
                />
              </div>

              {activeSubTab === 'products' && (
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={styles.filterSelect}
                >
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              )}

              {activeSubTab === 'placements' && (
                <>
                  <select
                    value={warehouseFilter}
                    onChange={(e) => setWarehouseFilter(e.target.value)}
                    style={styles.filterSelect}
                  >
                    <option value="">All Warehouses</option>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    style={styles.filterSelect}
                  >
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </>
              )}

              {activeSubTab === 'ledger' && (
                <select
                  value={txTypeFilter}
                  onChange={(e) => setTxTypeFilter(e.target.value)}
                  style={styles.filterSelect}
                >
                  <option value="">All Transactions</option>
                  <option value="inbound">Stock In (Inbound)</option>
                  <option value="outbound">Stock Out (Outbound)</option>
                  <option value="transfer">Transfers</option>
                </select>
              )}
            </div>

            {/* SUBTAB 1: PRODUCTS LISTING */}
            {activeSubTab === 'products' && (
              <div style={styles.tabContentCard}>
                <div style={styles.tableActionHeader}>
                  <h3 style={styles.tableTitle}>Product Catalog Records ({filteredItems.length})</h3>
                  {isWritable && (
                    <button
                      onClick={() => {
                        setItemForm({ id: null, name: '', sku: '', category_id: '', description: '', price: '', min_threshold: 10 });
                        setShowItemForm(true);
                      }}
                      style={styles.actionAddBtn}
                    >
                      <Plus size={16} />
                      <span>Add Product</span>
                    </button>
                  )}
                </div>

                {/* Form Slide Panel for Items */}
                {showItemForm && (
                  <form onSubmit={handleItemSubmit} style={styles.slideForm}>
                    <h4 style={styles.formTitle}>{itemForm.id ? 'Edit Product Catalog Entry' : 'Create New Product Catalog Entry'}</h4>
                    <div style={styles.formGrid}>
                      <div style={styles.formField}>
                        <label style={styles.formLabel}>Product Name *</label>
                        <input
                          type="text"
                          required
                          value={itemForm.name}
                          onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                          style={styles.formInput}
                          placeholder="e.g. Smart RFID tag"
                        />
                      </div>
                      <div style={styles.formField}>
                        <label style={styles.formLabel}>Custom SKU (Optional)</label>
                        <input
                          type="text"
                          value={itemForm.sku}
                          onChange={(e) => setItemForm({ ...itemForm, sku: e.target.value })}
                          style={styles.formInput}
                          placeholder="Autogenerated if empty"
                        />
                      </div>
                      <div style={styles.formField}>
                        <label style={styles.formLabel}>Category Tag</label>
                        <select
                          value={itemForm.category_id}
                          onChange={(e) => setItemForm({ ...itemForm, category_id: e.target.value })}
                          style={styles.formSelect}
                        >
                          <option value="">Select Category</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div style={styles.formField}>
                        <label style={styles.formLabel}>Catalog Price ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={itemForm.price}
                          onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                          style={styles.formInput}
                          placeholder="0.00"
                        />
                      </div>
                      <div style={styles.formField}>
                        <label style={styles.formLabel}>Low Stock Alert Threshold *</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={itemForm.min_threshold}
                          onChange={(e) => setItemForm({ ...itemForm, min_threshold: e.target.value })}
                          style={styles.formInput}
                          placeholder="10"
                        />
                      </div>
                      <div style={{ ...styles.formField, gridColumn: 'span 2' }}>
                        <label style={styles.formLabel}>Item Description</label>
                        <textarea
                          value={itemForm.description}
                          onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                          style={styles.formTextarea}
                          placeholder="Brief technical details or tags"
                        />
                      </div>
                    </div>
                    <div style={styles.formActionButtons}>
                      <button type="submit" disabled={isSubmitting} style={styles.formSubmitBtn}>
                        {isSubmitting ? <Loader2 size={16} className="spinning" /> : 'Save product'}
                      </button>
                      <button type="button" onClick={() => setShowItemForm(false)} style={styles.formCancelBtn}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Table Data */}
                {isLoadingData ? (
                  <div style={styles.loaderDeck}>
                    <Loader2 size={36} className="spinning" style={{ color: 'var(--accent)' }} />
                    <p>Syncing product catalogs...</p>
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div style={styles.emptyDeck}>
                    <FolderOpen size={48} style={{ opacity: 0.3 }} />
                    <p>No products registered yet. Click "Add Product" to create your first SKU.</p>
                  </div>
                ) : (
                  <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th>SKU Code</th>
                          <th>Product Name</th>
                          <th>Category Group</th>
                          <th>Base Price</th>
                          <th>Safety Threshold</th>
                          <th>Description</th>
                          {isWritable && <th>Actions</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredItems.map(item => (
                          <tr key={item.id}>
                            <td><code style={styles.skuBadge}>{item.sku}</code></td>
                            <td><strong style={{ color: 'var(--text-h)' }}>{item.name}</strong></td>
                            <td>
                              <span style={styles.categoryBadge}>
                                {item.category_name || 'Unassigned'}
                              </span>
                            </td>
                            <td>${item.price ? parseFloat(item.price).toFixed(2) : '0.00'}</td>
                            <td>
                              <span style={styles.thresholdBadge}>
                                &lt; {item.min_threshold || 10} units
                              </span>
                            </td>
                            <td style={styles.descCol}>{item.description || '-'}</td>
                            {isWritable && (
                              <td>
                                <div style={styles.tableActions}>
                                  <button onClick={() => handleEditItem(item)} style={styles.editIconBtn} title="Edit Product">
                                    <Edit size={16} />
                                  </button>
                                  {isAdmin && (
                                    <button onClick={() => handleDeleteItem(item.id)} style={styles.deleteIconBtn} title="Delete Product">
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* SUBTAB 2: WAREHOUSES LISTING */}
            {activeSubTab === 'warehouses' && (
              <div style={styles.tabContentCard}>
                <div style={styles.tableActionHeader}>
                  <h3 style={styles.tableTitle}>Registered Warehouses ({warehouses.length})</h3>
                  {isWritable && (
                    <button
                      onClick={() => {
                        setWarehouseForm({ id: null, name: '', location: '' });
                        setShowWarehouseForm(true);
                      }}
                      style={styles.actionAddBtn}
                    >
                      <Plus size={16} />
                      <span>Add Warehouse</span>
                    </button>
                  )}
                </div>

                {/* Form Slide Panel for Warehouses */}
                {showWarehouseForm && (
                  <form onSubmit={handleWarehouseSubmit} style={styles.slideForm}>
                    <h4 style={styles.formTitle}>{warehouseForm.id ? 'Edit Warehouse details' : 'Register New Warehouse'}</h4>
                    <div style={styles.formGrid}>
                      <div style={styles.formField}>
                        <label style={styles.formLabel}>Warehouse Title *</label>
                        <input
                          type="text"
                          required
                          value={warehouseForm.name}
                          onChange={(e) => setWarehouseForm({ ...warehouseForm, name: e.target.value })}
                          style={styles.formInput}
                          placeholder="e.g. North Side Logistics"
                        />
                      </div>
                      <div style={styles.formField}>
                        <label style={styles.formLabel}>Physical Location Address</label>
                        <input
                          type="text"
                          value={warehouseForm.location}
                          onChange={(e) => setWarehouseForm({ ...warehouseForm, location: e.target.value })}
                          style={styles.formInput}
                          placeholder="e.g. building B, Bay 4"
                        />
                      </div>
                    </div>
                    <div style={styles.formActionButtons}>
                      <button type="submit" disabled={isSubmitting} style={styles.formSubmitBtn}>
                        {isSubmitting ? <Loader2 size={16} className="spinning" /> : 'Save warehouse'}
                      </button>
                      <button type="button" onClick={() => setShowWarehouseForm(false)} style={styles.formCancelBtn}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Table Data */}
                {isLoadingData ? (
                  <div style={styles.loaderDeck}>
                    <Loader2 size={36} className="spinning" style={{ color: 'var(--accent)' }} />
                    <p>Syncing warehouse centers...</p>
                  </div>
                ) : warehouses.length === 0 ? (
                  <div style={styles.emptyDeck}>
                    <MapPin size={48} style={{ opacity: 0.3 }} />
                    <p>No warehouses registered. Click "Add Warehouse" to establish your first logistics center.</p>
                  </div>
                ) : (
                  <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th>Warehouse ID</th>
                          <th>Warehouse Title</th>
                          <th>Physical Location</th>
                          <th>Created At</th>
                          {isWritable && <th>Actions</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {warehouses.map(wh => (
                          <tr key={wh.id}>
                            <td><code>WH-{wh.id}</code></td>
                            <td><strong style={{ color: 'var(--text-h)' }}>{wh.name}</strong></td>
                            <td>{wh.location || 'Not Specified'}</td>
                            <td>{new Date(wh.created_at).toLocaleString()}</td>
                            {isWritable && (
                              <td>
                                <div style={styles.tableActions}>
                                  <button onClick={() => handleEditWarehouse(wh)} style={styles.editIconBtn} title="Edit Warehouse">
                                    <Edit size={16} />
                                  </button>
                                  {isAdmin && (
                                    <button onClick={() => handleDeleteWarehouse(wh.id)} style={styles.deleteIconBtn} title="Delete Warehouse">
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* SUBTAB 3: CATEGORIES LISTING */}
            {activeSubTab === 'categories' && (
              <div style={styles.tabContentCard}>
                <div style={styles.tableActionHeader}>
                  <h3 style={styles.tableTitle}>Category Catalog Groups ({categories.length})</h3>
                  {isWritable && (
                    <button
                      onClick={() => {
                        setCategoryForm({ id: null, name: '' });
                        setShowCategoryForm(true);
                      }}
                      style={styles.actionAddBtn}
                    >
                      <Plus size={16} />
                      <span>Add Category</span>
                    </button>
                  )}
                </div>

                {/* Form Slide Panel for Categories */}
                {showCategoryForm && (
                  <form onSubmit={handleCategorySubmit} style={styles.slideForm}>
                    <h4 style={styles.formTitle}>{categoryForm.id ? 'Edit Category Tag name' : 'Add Category Tag'}</h4>
                    <div style={styles.formGrid}>
                      <div style={{ ...styles.formField, gridColumn: 'span 2' }}>
                        <label style={styles.formLabel}>Category Tag Title *</label>
                        <input
                          type="text"
                          required
                          value={categoryForm.name}
                          onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                          style={styles.formInput}
                          placeholder="e.g. Heavy Duty Hardware"
                        />
                      </div>
                    </div>
                    <div style={styles.formActionButtons}>
                      <button type="submit" disabled={isSubmitting} style={styles.formSubmitBtn}>
                        {isSubmitting ? <Loader2 size={16} className="spinning" /> : 'Save Tag'}
                      </button>
                      <button type="button" onClick={() => setShowCategoryForm(false)} style={styles.formCancelBtn}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Table Data */}
                {isLoadingData ? (
                  <div style={styles.loaderDeck}>
                    <Loader2 size={36} className="spinning" style={{ color: 'var(--accent)' }} />
                    <p>Syncing product categories...</p>
                  </div>
                ) : categories.length === 0 ? (
                  <div style={styles.emptyDeck}>
                    <Tag size={48} style={{ opacity: 0.3 }} />
                    <p>No categories created. Click "Add Category" to start clustering products.</p>
                  </div>
                ) : (
                  <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th>Category ID</th>
                          <th>Category Tag Title</th>
                          {isWritable && <th>Actions</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map(cat => (
                          <tr key={cat.id}>
                            <td><code>CAT-{cat.id}</code></td>
                            <td><strong style={{ color: 'var(--text-h)' }}>{cat.name}</strong></td>
                            {isWritable && (
                              <td>
                                <div style={styles.tableActions}>
                                  <button onClick={() => handleEditCategory(cat)} style={styles.editIconBtn} title="Edit Category">
                                    <Edit size={16} />
                                  </button>
                                  <button onClick={() => handleDeleteCategory(cat.id)} style={styles.deleteIconBtn} title="Delete Category">
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* SUBTAB 4: STOCK PLACEMENTS & RACKING COORDINATES */}
            {activeSubTab === 'placements' && (
              <div style={styles.tabContentCard}>
                <div style={styles.tableActionHeader}>
                  <h3 style={styles.tableTitle}>Stock Placements & Racking Coordinates ({filteredStock.length})</h3>
                  {isWritable && (
                    <button
                      onClick={() => {
                        setPlacementForm({ item_id: '', warehouse_id: '', quantity: '', rack: '', shelf: '', bin: '' });
                        setShowPlacementForm(true);
                      }}
                      style={styles.actionAddBtn}
                    >
                      <Plus size={16} />
                      <span>Place & Rack Stock</span>
                    </button>
                  )}
                </div>

                {/* Form Slide Panel for Placements */}
                {showPlacementForm && (
                  <form onSubmit={handlePlacementSubmit} style={styles.slideForm}>
                    <h4 style={styles.formTitle}>Allocate Product Placement & Shelf Position</h4>
                    <div style={styles.formGrid}>
                      <div style={styles.formField}>
                        <label style={styles.formLabel}>Select Product *</label>
                        <select
                          required
                          value={placementForm.item_id}
                          onChange={(e) => setPlacementForm({ ...placementForm, item_id: e.target.value })}
                          style={styles.formSelect}
                        >
                          <option value="">Select SKU Product</option>
                          {items.map(i => <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>)}
                        </select>
                      </div>

                      <div style={styles.formField}>
                        <label style={styles.formLabel}>Select Warehouse *</label>
                        <select
                          required
                          value={placementForm.warehouse_id}
                          onChange={(e) => setPlacementForm({ ...placementForm, warehouse_id: e.target.value })}
                          style={styles.formSelect}
                        >
                          <option value="">Select Warehouse Center</option>
                          {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                      </div>

                      <div style={styles.formField}>
                        <label style={styles.formLabel}>Quantity On Shelves *</label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={placementForm.quantity}
                          onChange={(e) => setPlacementForm({ ...placementForm, quantity: e.target.value })}
                          style={styles.formInput}
                          placeholder="e.g. 200"
                        />
                      </div>

                      <div style={styles.formField}>
                        <label style={styles.formLabel}>Physical Rack Location</label>
                        <input
                          type="text"
                          value={placementForm.rack}
                          onChange={(e) => setPlacementForm({ ...placementForm, rack: e.target.value })}
                          style={styles.formInput}
                          placeholder="e.g. Rack B"
                        />
                      </div>

                      <div style={styles.formField}>
                        <label style={styles.formLabel}>Physical Shelf Level</label>
                        <input
                          type="text"
                          value={placementForm.shelf}
                          onChange={(e) => setPlacementForm({ ...placementForm, shelf: e.target.value })}
                          style={styles.formInput}
                          placeholder="e.g. Shelf 3"
                        />
                      </div>

                      <div style={styles.formField}>
                        <label style={styles.formLabel}>Physical Bin Location</label>
                        <input
                          type="text"
                          value={placementForm.bin}
                          onChange={(e) => setPlacementForm({ ...placementForm, bin: e.target.value })}
                          style={styles.formInput}
                          placeholder="e.g. Bin 14"
                        />
                      </div>
                    </div>
                    <div style={styles.formActionButtons}>
                      <button type="submit" disabled={isSubmitting} style={styles.formSubmitBtn}>
                        {isSubmitting ? <Loader2 size={16} className="spinning" /> : 'Set Placement'}
                      </button>
                      <button type="button" onClick={() => setShowPlacementForm(false)} style={styles.formCancelBtn}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Table Data */}
                {isLoadingData ? (
                  <div style={styles.loaderDeck}>
                    <Loader2 size={36} className="spinning" style={{ color: 'var(--accent)' }} />
                    <p>Syncing physical layout indexes...</p>
                  </div>
                ) : filteredStock.length === 0 ? (
                  <div style={styles.emptyDeck}>
                    <Boxes size={48} style={{ opacity: 0.3 }} />
                    <p>No products placed on racks yet. Click "Place & Rack Stock" to allocate items to shelves.</p>
                  </div>
                ) : (
                  <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th>Product details</th>
                          <th>Warehouse</th>
                          <th>In-Stock Qty</th>
                          <th>Rack Row</th>
                          <th>Shelf Row</th>
                          <th>Bin Box</th>
                          <th>Last Audited</th>
                          {isWritable && <th>Actions</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStock.map(stock => (
                          <tr key={stock.id}>
                            <td>
                              <div style={styles.stockProductCol}>
                                <span style={styles.stockProductName}>{stock.item_name}</span>
                                <code style={styles.skuBadge}>{stock.item_sku}</code>
                              </div>
                            </td>
                            <td>
                              <div style={styles.stockProductCol}>
                                <span style={{ fontWeight: '500', color: 'var(--text-h)' }}>{stock.warehouse_name}</span>
                                <span style={{ fontSize: '12px' }}>{stock.warehouse_location}</span>
                              </div>
                            </td>
                            <td>
                              <span style={stock.quantity < (stock.min_threshold || 10) ? styles.lowStockCountBadge : styles.stockCountBadge}>
                                {stock.quantity} units
                              </span>
                            </td>
                            <td><span style={styles.coordBadge}>{stock.rack || 'A-Zone'}</span></td>
                            <td><span style={styles.coordBadge}>{stock.shelf || 'Level 1'}</span></td>
                            <td><span style={styles.coordBadge}>{stock.bin || 'General'}</span></td>
                            <td>{new Date(stock.last_updated).toLocaleString()}</td>
                            {isWritable && (
                              <td>
                                <div style={styles.tableActions}>
                                  <button onClick={() => handleEditPlacement(stock)} style={styles.editIconBtn} title="Adjust Stock Coordinates">
                                    <Edit size={16} />
                                  </button>
                                  <button onClick={() => handleDeletePlacement(stock.id)} style={styles.deleteIconBtn} title="Remove Stock Placement">
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* SUBTAB 5: STOCK ADJUSTER (FLOW TRANSACTIONS) */}
            {activeSubTab === 'adjust' && (
              <div style={styles.tabContentCard}>
                <div style={styles.tableActionHeader}>
                  <h3 style={styles.tableTitle}>Stock Flow Adjuster Console</h3>
                  <div style={styles.simNoticeBadge}>
                    <Info size={16} />
                    <span>Executing Outbound or Transfer alerts are logged to server output.</span>
                  </div>
                </div>

                <form onSubmit={handleStockFlowSubmit} style={styles.transactionFormContainer}>
                  <div style={styles.formGrid}>
                    <div style={styles.formField}>
                      <label style={styles.formLabel}>Movement Type *</label>
                      <select
                        required
                        value={adjustForm.type}
                        onChange={(e) => setAdjustForm({ ...adjustForm, type: e.target.value })}
                        style={styles.formSelect}
                      >
                        <option value="inbound">Stock In (Inbound)</option>
                        <option value="outbound">Stock Out (Outbound)</option>
                        <option value="transfer">Warehouse Transfer</option>
                      </select>
                    </div>

                    <div style={{ ...styles.formField, width: '100%' }}>
                      <label style={styles.formLabel}>Select Product *</label>
                      <div style={{ display: 'flex', gap: '8px', width: '100%', alignItems: 'center' }}>
                        <select
                          required
                          value={adjustForm.item_id}
                          onChange={(e) => setAdjustForm({ ...adjustForm, item_id: e.target.value })}
                          style={{ ...styles.formSelect, flexGrow: 1 }}
                        >
                          <option value="">Choose SKU Product</option>
                          {items.map(i => <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>)}
                        </select>
                        <button
                          type="button"
                          onClick={() => { setShowScanner(true); setScannerValue(''); }}
                          style={{
                            background: 'var(--accent-bg)',
                            color: 'var(--accent)',
                            border: '1px solid var(--accent-border)',
                            padding: '10px 14px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '42px',
                          }}
                          title="Scan SKU Barcode"
                        >
                          <QrCode size={18} />
                        </button>
                      </div>
                    </div>

                    <div style={styles.formField}>
                      <label style={styles.formLabel}>
                        {adjustForm.type === 'transfer' ? 'Source Warehouse *' : 'Warehouse *'}
                      </label>
                      <select
                        required
                        value={adjustForm.warehouse_id}
                        onChange={(e) => setAdjustForm({ ...adjustForm, warehouse_id: e.target.value })}
                        style={styles.formSelect}
                      >
                        <option value="">Choose Warehouse</option>
                        {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                      </select>
                    </div>

                    {adjustForm.type === 'transfer' && (
                      <div style={styles.formField}>
                        <label style={styles.formLabel}>Destination Warehouse *</label>
                        <select
                          required
                          value={adjustForm.target_warehouse_id}
                          onChange={(e) => setAdjustForm({ ...adjustForm, target_warehouse_id: e.target.value })}
                          style={styles.formSelect}
                        >
                          <option value="">Choose Target Warehouse</option>
                          {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                      </div>
                    )}

                    <div style={styles.formField}>
                      <label style={styles.formLabel}>Transaction Quantity *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={adjustForm.quantity}
                        onChange={(e) => setAdjustForm({ ...adjustForm, quantity: e.target.value })}
                        style={styles.formInput}
                        placeholder="e.g. 50"
                      />
                    </div>

                    <div style={{ ...styles.formField, gridColumn: 'span 2' }}>
                      <label style={styles.formLabel}>Transaction Notes / Reference</label>
                      <input
                        type="text"
                        value={adjustForm.notes}
                        onChange={(e) => setAdjustForm({ ...adjustForm, notes: e.target.value })}
                        style={styles.formInput}
                        placeholder="e.g. Invoice PO-8419 or balance re-allocation"
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: '20px' }}>
                    <button type="submit" disabled={isSubmitting} style={styles.actionAddBtn}>
                      {isSubmitting ? <Loader2 size={16} className="spinning" /> : 'Execute Stock Transaction'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* SUBTAB 6: LEDGER HISTORICAL TRAILS */}
            {activeSubTab === 'ledger' && (
              <div style={styles.tabContentCard}>
                <h3 style={styles.tableTitle}>Chronological Transaction Ledger Feed ({filteredTransactions.length})</h3>

                {isLoadingData ? (
                  <div style={styles.loaderDeck}>
                    <Loader2 size={36} className="spinning" style={{ color: 'var(--accent)' }} />
                    <p>Loading ledger ledgers...</p>
                  </div>
                ) : filteredTransactions.length === 0 ? (
                  <div style={styles.emptyDeck}>
                    <History size={48} style={{ opacity: 0.3 }} />
                    <p>No transaction history logged. Execute stock adjustments to generate ledger ledger lines.</p>
                  </div>
                ) : (
                  <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th>Timestamp</th>
                          <th>Product SKU</th>
                          <th>Warehouse</th>
                          <th>Type</th>
                          <th>Quantity</th>
                          <th>Operator</th>
                          <th>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.map(tx => (
                          <tr key={tx.id}>
                            <td>{new Date(tx.transaction_date).toLocaleString()}</td>
                            <td>
                              <div style={styles.stockProductCol}>
                                <span style={styles.stockProductName}>{tx.item_name}</span>
                                <code style={styles.skuBadge}>{tx.item_sku}</code>
                              </div>
                            </td>
                            <td><strong>{tx.warehouse_name}</strong></td>
                            <td>
                              <span style={
                                tx.type === 'inbound' ? styles.inboundLabel :
                                tx.type === 'outbound' ? styles.outboundLabel : styles.transferLabel
                              }>
                                {tx.type.toUpperCase()}
                              </span>
                            </td>
                            <td>
                              <strong style={tx.quantity > 0 ? { color: '#22c55e' } : { color: '#ef4444' }}>
                                {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}
                              </strong>
                            </td>
                            <td>
                              <div style={styles.operatorCol}>
                                <User size={13} />
                                <span>{tx.operator_username || 'System'}</span>
                              </div>
                            </td>
                            <td style={styles.descCol}>{tx.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* SCREEN 3: SYSTEM ALERTS & NOTIFICATION PANEL */}
        {activeMenu === 'alerts_panel' && (
          <div style={styles.tabContentCard}>
            <div style={styles.tableActionHeader}>
              <h3 style={styles.tableTitle}>Low Stock Procurement Suggestion Index ({lowStockAlerts.length})</h3>
              <div style={styles.alertNoticeBadge}>
                <AlertTriangle size={16} />
                <span>Procurements suggested for highlighted items.</span>
              </div>
            </div>

            {isLoadingData ? (
              <div style={styles.loaderDeck}>
                <Loader2 size={36} className="spinning" style={{ color: 'var(--accent)' }} />
                <p>Checking safety levels...</p>
              </div>
            ) : lowStockAlerts.length === 0 ? (
              <div style={styles.successDeck}>
                <Shield size={48} style={{ color: '#22c55e' }} />
                <h4 style={{ color: '#22c55e', margin: '12px 0 6px 0' }}>All Stock Levels Safe</h4>
                <p>There are no products currently falling below safety thresholds.</p>
              </div>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU Code</th>
                      <th>Warehouse Center</th>
                      <th>Safety Level</th>
                      <th>Current Balance</th>
                      <th>Status Flag</th>
                      <th>Replenishment Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockAlerts.map(stock => (
                      <tr key={stock.id} style={{ background: 'rgba(239,68,68,0.03)' }}>
                        <td><strong style={{ color: 'var(--text-h)' }}>{stock.item_name}</strong></td>
                        <td><code style={styles.skuBadge}>{stock.item_sku}</code></td>
                        <td><strong>{stock.warehouse_name}</strong></td>
                        <td>
                          <span style={styles.thresholdBadge}>
                            &lt; {stock.min_threshold} units
                          </span>
                        </td>
                        <td>
                          <span style={styles.lowStockCountBadge}>
                            {stock.quantity} units
                          </span>
                        </td>
                        <td>
                          <div style={styles.criticalLabel}>
                            <TrendingDown size={14} />
                            <span>CRITICAL DEPLETION</span>
                          </div>
                        </td>
                        <td>
                          <button
                            onClick={() => handleTriggerQuickRestock(stock)}
                            style={styles.quickRestockBtn}
                          >
                            Restock +100
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SCREEN 4: AI DEMAND FORECAST & PREDICTIVE ANALYTICS */}
        {activeMenu === 'ai_forecast' && (
          <div style={styles.panelContainer}>
            {/* KPI Cards Row */}
            <section style={styles.kpiGrid}>
              <div style={styles.kpiCard}>
                <div style={styles.kpiHeader}>
                  <span style={styles.kpiTitle}>Restock Needed</span>
                  <Sparkles size={20} style={{ color: 'var(--accent)' }} />
                </div>
                <div style={styles.kpiValue}>
                  {forecasts.filter(f => f.status === 'RESTOCK_RECOMMENDED').length}
                </div>
                <p style={styles.kpiFooter}>Products below safety reorder point</p>
              </div>

              <div style={styles.kpiCard}>
                <div style={styles.kpiHeader}>
                  <span style={styles.kpiTitle}>Avg Daily Sales Velocity</span>
                  <TrendingUp size={20} style={{ color: '#3b82f6' }} />
                </div>
                <div style={styles.kpiValue}>
                  {forecasts.length > 0
                    ? (forecasts.reduce((sum, f) => sum + f.daily_velocity, 0) / forecasts.length).toFixed(1)
                    : '0.0'}
                </div>
                <p style={styles.kpiFooter}>Units dispatched / day baseline</p>
              </div>

              <div style={styles.kpiCard}>
                <div style={styles.kpiHeader}>
                  <span style={styles.kpiTitle}>Seasonal Adjustments</span>
                  <Cpu size={20} style={{ color: '#10b981' }} />
                </div>
                <div style={styles.kpiValue}>
                  {forecasts.filter(f => f.seasonal_factor > 1.05).length}
                </div>
                <p style={styles.kpiFooter}>Active category demand spikes</p>
              </div>

              <div style={styles.kpiCard}>
                <div style={styles.kpiHeader}>
                  <span style={styles.kpiTitle}>Flagged Anomalies</span>
                  <AlertTriangle size={20} style={anomalies.length > 0 ? { color: '#ef4444' } : { color: 'var(--text)' }} />
                </div>
                <div style={styles.kpiValue}>{anomalies.length}</div>
                <p style={styles.kpiFooter}>Sales spikes &gt; 1.5 StdDevs caught</p>
              </div>
            </section>

            {/* Split Grid: Graph & Outlier Feed */}
            <div style={styles.grid}>
              {/* Graph Panel */}
              <div style={styles.profileCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ ...styles.cardTitle, margin: 0 }}>Seasonal Demand Projections</h3>
                  <select
                    value={selectedForecastItem}
                    onChange={(e) => setSelectedForecastItem(e.target.value)}
                    style={styles.filterSelect}
                  >
                    {forecasts.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>

                {forecasts.length === 0 ? (
                  <div style={styles.emptyDeck}>
                    <BarChart3 size={48} style={{ opacity: 0.3 }} />
                    <p>No products found in catalog. Create items to calculate projections.</p>
                  </div>
                ) : (
                  <div>
                    {(() => {
                      const currentForecast = forecasts.find(f => f.id.toString() === selectedForecastItem);
                      const points = getMonthlyDataPoints(currentForecast);
                      if (points.length === 0) return null;
                      
                      const maxVal = Math.max(...points.map(p => p.value), 10);
                      
                      // Width 540, Height 180
                      const width = 540;
                      const height = 180;
                      const paddingX = 40;
                      const paddingY = 20;
                      
                      const svgPoints = points.map((p, idx) => {
                        const x = paddingX + idx * ((width - 2 * paddingX) / 11);
                        const y = height - paddingY - (p.value / maxVal) * (height - 2 * paddingY - 10);
                        return { x, y, ...p, index: idx };
                      });
                      
                      const pathD = svgPoints.reduce((acc, p, idx) => {
                        return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
                      }, '');
                      
                      const areaD = svgPoints.length > 0 
                        ? `${pathD} L ${svgPoints[svgPoints.length - 1].x} ${height - paddingY} L ${svgPoints[0].x} ${height - paddingY} Z`
                        : '';
                        
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {/* Active Forecast Specs */}
                          {currentForecast && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', background: 'var(--code-bg)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                              <span><strong>SKU:</strong> <code>{currentForecast.sku}</code></span>
                              <span><strong>Category:</strong> {currentForecast.category}</span>
                              <span><strong>Seasonal Boost:</strong> <strong style={{ color: 'var(--accent)' }}>{((currentForecast.seasonal_factor - 1) * 100).toFixed(0)}%</strong></span>
                            </div>
                          )}

                          {/* Hover Details Panel */}
                          <div style={{ minHeight: '24px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: 'var(--accent)' }}>
                            {hoveredPoint !== null ? (
                              <span>Projected Demand in {svgPoints[hoveredPoint].month}: {svgPoints[hoveredPoint].value} units</span>
                            ) : (
                              <span style={{ opacity: 0.6, fontSize: '13px', fontWeight: 'normal', color: 'var(--text)' }}>Hover over graph nodes to see projected values</span>
                            )}
                          </div>

                          <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ background: 'var(--code-bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <defs>
                              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
                                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>
                            
                            {/* Horizontal Gridlines */}
                            {[0.25, 0.5, 0.75, 1.0].map((ratio, idx) => {
                              const y = height - paddingY - ratio * (height - 2 * paddingY - 10);
                              return (
                                <line
                                  key={idx}
                                  x1={paddingX}
                                  y1={y}
                                  x2={width - paddingX}
                                  y2={y}
                                  stroke="var(--border)"
                                  strokeDasharray="4 4"
                                />
                              );
                            })}
                            
                            {/* Gradient Area Fill */}
                            {areaD && <path d={areaD} fill="url(#areaGrad)" />}
                            
                            {/* Demand Line */}
                            {pathD && (
                              <path
                                d={pathD}
                                fill="none"
                                stroke="var(--accent)"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            )}
                            
                            {/* Circular Nodes */}
                            {svgPoints.map((p, idx) => (
                              <g key={idx}>
                                <circle
                                  cx={p.x}
                                  cy={p.y}
                                  r={hoveredPoint === idx ? 6 : 4}
                                  fill={hoveredPoint === idx ? 'var(--accent)' : 'var(--bg)'}
                                  stroke="var(--accent)"
                                  strokeWidth="2"
                                  onMouseEnter={() => setHoveredPoint(idx)}
                                  onMouseLeave={() => setHoveredPoint(null)}
                                  style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                                />
                                <text
                                  x={p.x}
                                  y={height - 5}
                                  textAnchor="middle"
                                  fontSize="10"
                                  fill="var(--text)"
                                  opacity="0.8"
                                >
                                  {p.month}
                                </text>
                              </g>
                            ))}
                          </svg>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Anomaly Logs Panel */}
              <div style={styles.profileCard}>
                <h3 style={styles.cardTitle}>Statistical Sales Outliers</h3>
                {isLoadingData ? (
                  <div style={styles.loaderDeck}>
                    <Loader2 size={24} className="spinning" style={{ color: 'var(--accent)' }} />
                    <p>Auditing transaction ledger variance...</p>
                  </div>
                ) : anomalies.length === 0 ? (
                  <div style={styles.successDeck}>
                    <Shield size={36} style={{ color: '#10b981', opacity: 0.8 }} />
                    <h4 style={{ color: '#10b981', margin: '8px 0 4px 0', fontSize: '15px' }}>Zero Outliers Flagged</h4>
                    <p style={{ fontSize: '13px' }}>All outbounds conform within standard standard deviation bands.</p>
                  </div>
                ) : (
                  <div style={{ maxHeight: '215px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
                    {anomalies.map((anom, idx) => (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px', border: '1px solid rgba(239, 68, 68, 0.25)', background: 'rgba(239, 68, 68, 0.03)', borderRadius: '8px', padding: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: '600', color: 'var(--text-h)', fontSize: '14px' }}>{anom.item_name}</span>
                          <span style={{ fontSize: '11px', fontWeight: 'bold', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '2px 6px', borderRadius: '4px' }}>
                            {anom.deviation.toFixed(1)}σ SPIKE
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text)' }}>
                          <span>Outbound size: <strong>{anom.quantity} units</strong> (Avg: {anom.avg_size} units)</span>
                          <span>{new Date(anom.transaction_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* AI Purchase Recommendations */}
            <div style={styles.tabContentCard}>
              <div style={styles.tableActionHeader}>
                <h3 style={styles.tableTitle}>AI Smart Replenishment Purchase Recommendations</h3>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleExportPDF}
                    style={{
                      ...styles.actionAddBtn,
                      background: 'var(--accent-bg)',
                      color: 'var(--accent)',
                      border: '1px solid var(--accent-border)',
                      boxShadow: 'none',
                    }}
                  >
                    <span>Export PDF Report</span>
                  </button>
                  <button
                    onClick={handleExportExcel}
                    style={{
                      ...styles.actionAddBtn,
                      background: '#10b981',
                      color: '#fff',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                    }}
                  >
                    <span>Export Excel (CSV)</span>
                  </button>
                </div>
              </div>

              {isLoadingData ? (
                <div style={styles.loaderDeck}>
                  <Loader2 size={36} className="spinning" style={{ color: 'var(--accent)' }} />
                  <p>Calculating reorder parameters...</p>
                </div>
              ) : forecasts.length === 0 ? (
                <div style={styles.emptyDeck}>
                  <BarChart3 size={48} style={{ opacity: 0.3 }} />
                  <p>No statistical insights compiled. Seed products and outbounds in adjustments.</p>
                </div>
              ) : (
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th>Product Details</th>
                        <th>Current stock</th>
                        <th>Velocity</th>
                        <th>Reorder point</th>
                        <th>Seasonal Factor</th>
                        <th>30-Day Demand</th>
                        <th>Recommendation</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {forecasts.map(f => (
                        <tr key={f.id} style={f.status === 'RESTOCK_RECOMMENDED' ? { background: 'rgba(170, 59, 255, 0.02)' } : {}}>
                          <td>
                            <div style={styles.stockProductCol}>
                              <span style={styles.stockProductName}>{f.name}</span>
                              <code style={styles.skuBadge}>{f.sku}</code>
                            </div>
                          </td>
                          <td>
                            <strong style={f.status === 'RESTOCK_RECOMMENDED' ? { color: '#ef4444' } : { color: 'var(--text-h)' }}>
                              {f.current_stock} units
                            </strong>
                          </td>
                          <td>{f.daily_velocity} / day</td>
                          <td>
                            <span style={styles.thresholdBadge}>
                              &lt; {f.reorder_point} units
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: f.seasonal_factor > 1.05 ? 'var(--accent)' : 'var(--text)' }}>
                              {f.seasonal_factor.toFixed(2)}x
                            </span>
                          </td>
                          <td>
                            <strong>{f.predicted_demand} units</strong>
                          </td>
                          <td>
                            {f.status === 'RESTOCK_RECOMMENDED' ? (
                              <span style={{ fontSize: '12px', fontWeight: 'bold', background: 'rgba(170, 59, 255, 0.1)', color: 'var(--accent)', border: '1px solid rgba(170, 59, 255, 0.3)', padding: '4px 10px', borderRadius: '12px' }}>
                                ORDER +{f.recommendation}
                              </span>
                            ) : (
                              <span style={{ fontSize: '12px', fontWeight: 'bold', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '4px 10px', borderRadius: '12px' }}>
                                SAFE
                              </span>
                            )}
                          </td>
                          <td>
                            <button
                              disabled={f.recommendation <= 0}
                              onClick={() => handleTriggerAIProcure(f.id, f.recommendation)}
                              style={{
                                ...styles.quickRestockBtn,
                                opacity: f.recommendation <= 0 ? 0.4 : 1,
                                cursor: f.recommendation <= 0 ? 'not-allowed' : 'pointer',
                              }}
                            >
                              Restock Now
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SCREEN 5: AI MANAGER ASSISTANT CHAT CONSOLE */}
        {activeMenu === 'ai_chat' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 200px)' }}>
            {/* Conversations container */}
            <div style={{
              flexGrow: 1,
              overflowY: 'auto',
              background: 'var(--code-bg)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    background: msg.sender === 'user' ? 'var(--accent)' : 'var(--bg)',
                    color: msg.sender === 'user' ? '#fff' : 'var(--text-h)',
                    border: msg.sender === 'user' ? 'none' : '1px solid var(--border)',
                    padding: msg.sender === 'user' ? '10px 16px' : '12px 18px',
                    borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    maxWidth: '75%',
                    boxShadow: msg.sender === 'user' ? '0 2px 8px rgba(170, 59, 255, 0.2)' : 'var(--shadow)',
                    whiteSpace: 'pre-wrap',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    textAlign: 'left'
                  }}
                >
                  {(() => {
                    const parts = msg.text.split(/(\*\*[^*]+\*\*)/g);
                    return parts.map((part, pIdx) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
                      }
                      return part;
                    });
                  })()}
                </div>
              ))}

              {isSendingChat && (
                <div style={{
                  alignSelf: 'flex-start',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  padding: '12px 18px',
                  borderRadius: '14px 14px 14px 2px',
                  boxShadow: 'var(--shadow)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '14px'
                }}>
                  <Loader2 size={16} className="spinning" style={{ color: 'var(--accent)' }} />
                  <span>Antigravity AI is scanning inventory bays...</span>
                </div>
              )}
            </div>

            {/* Template Chips Panel */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text)' }}>Suggested queries:</span>
              {[
                'Show low stock warnings',
                'Recommend restocking orders',
                'Audit sales anomalies',
                'Check Mango details'
              ].map((tmpl, idx) => (
                <button
                  key={idx}
                  onClick={(e) => handleSendChat(e, tmpl)}
                  disabled={isSendingChat}
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '20px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: 'var(--text-h)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {tmpl}
                </button>
              ))}
            </div>

            {/* Bottom Form Submission bar */}
            <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask anything about warehouse assets or type a suggested query above..."
                disabled={isSendingChat}
                style={{
                  flexGrow: 1,
                  padding: '14px 18px',
                  fontSize: '14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text-h)',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isSendingChat}
                style={{
                  background: 'var(--accent)',
                  color: '#fff',
                  border: 'none',
                  padding: '0 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: !chatInput.trim() || isSendingChat ? 0.6 : 1,
                }}
              >
                <span>Send</span>
              </button>
            </form>
          </div>
        )}
      </main>

      {/* simulated QR scanner overlay modal */}
      {showScanner && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(8, 6, 13, 0.75)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          animation: 'fadeIn 0.25s ease'
        }}>
          <div style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '440px',
            width: '90%',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
            textAlign: 'center',
            position: 'relative',
            boxSizing: 'border-box'
          }}>
            <div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '700', color: 'var(--text-h)' }}>
                Interactive SKU Barcode Scanner
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text)' }}>
                Point camera at the product package SKU or select simulated code below.
              </p>
            </div>

            {/* Glowing camera lens bracket frame container */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: '220px',
              background: '#000',
              borderRadius: '10px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 0 20px rgba(170, 59, 255, 0.4)'
            }}>
              {/* Neon scanline laser beam */}
              <div style={{
                position: 'absolute',
                left: 0,
                width: '100%',
                height: '3px',
                background: 'linear-gradient(to right, transparent, #c084fc, #aa3bff, #c084fc, transparent)',
                boxShadow: '0 0 10px #aa3bff',
                animation: 'scan 2.0s linear infinite'
              }}></div>

              {/* Framing scanner corner brackets */}
              <div style={{
                position: 'absolute',
                width: '140px',
                height: '140px',
                border: '2px solid rgba(34, 197, 94, 0.25)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {/* glowing green scanner corner indicators */}
                <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '16px', height: '16px', borderTop: '4px solid #22c55e', borderLeft: '4px solid #22c55e', borderRadius: '4px 0 0 0' }}></div>
                <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '16px', height: '16px', borderTop: '4px solid #22c55e', borderRight: '4px solid #22c55e', borderRadius: '0 4px 0 0' }}></div>
                <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '16px', height: '16px', borderBottom: '4px solid #22c55e', borderLeft: '4px solid #22c55e', borderRadius: '0 0 0 4px' }}></div>
                <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '16px', height: '16px', borderBottom: '4px solid #22c55e', borderRight: '4px solid #22c55e', borderRadius: '0 0 4px 0' }}></div>
                
                <Scan size={42} style={{ color: '#22c55e', opacity: 0.8, animation: 'pulse 1.5s infinite' }} />
              </div>

              <div style={{
                position: 'absolute',
                bottom: '12px',
                fontSize: '11px',
                color: '#22c55e',
                fontFamily: 'ui-monospace, monospace',
                letterSpacing: '0.5px'
              }}>
                CAMERA LENS FEED // ACTIVE
              </div>
            </div>

            {/* SKU dropdown target selector */}
            <form onSubmit={handleConfirmScan} style={{ display: 'flex', flexDirection: 'column', gap: '20px', boxSizing: 'border-box' }}>
              <div style={{ ...styles.formField, width: '100%' }}>
                <label style={styles.formLabel}>Target Scan SKU *</label>
                <select
                  required
                  value={scannerValue}
                  onChange={(e) => setScannerValue(e.target.value)}
                  style={styles.formSelect}
                >
                  <option value="">Align Barcode with Lens (Choose SKU)</option>
                  {items.map(i => (
                    <option key={i.id} value={i.id}>{i.name} [SKU: {i.sku}]</option>
                  ))}
                </select>
              </div>

              {/* Action buttons */}
              <div style={styles.formActionButtons}>
                <button
                  type="submit"
                  disabled={!scannerValue}
                  style={{
                    ...styles.formSubmitBtn,
                    flexGrow: 1,
                    justifyContent: 'center',
                    opacity: !scannerValue ? 0.6 : 1,
                    cursor: !scannerValue ? 'not-allowed' : 'pointer'
                  }}
                >
                  Confirm Scan
                </button>
                <button
                  type="button"
                  onClick={() => setShowScanner(false)}
                  style={{ ...styles.formCancelBtn, flexGrow: 1 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: 'var(--bg)',
    color: 'var(--text)',
    fontFamily: 'var(--sans)',
  },
  sidebar: {
    width: '260px',
    background: 'var(--bg)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
    boxSizing: 'border-box',
    flexShrink: 0,
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '40px',
  },
  logoWrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: 'var(--accent)',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    boxShadow: '0 2px 8px rgba(170, 59, 255, 0.4)',
  },
  logoText: {
    fontFamily: 'var(--heading)',
  },
  brandName: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-h)',
    letterSpacing: '-0.3px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flexGrow: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    width: '100%',
    color: 'var(--text)',
    textAlign: 'left',
    position: 'relative',
    transition: 'background 0.2s, color 0.2s',
  },
  activeNavItem: {
    background: 'var(--accent-bg)',
    color: 'var(--accent)',
    border: '1px solid var(--accent-border)',
    fontWeight: '600',
  },
  navItemDisabled: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '15px',
    color: 'var(--text)',
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  alertCountIcon: {
    position: 'absolute',
    right: '16px',
    background: '#ef4444',
    color: '#fff',
    fontSize: '11px',
    fontWeight: 'bold',
    padding: '2px 6px',
    borderRadius: '10px',
  },
  sidebarFooter: {
    marginTop: 'auto',
    borderTop: '1px solid var(--border)',
    paddingTop: '20px',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: 'none',
    background: 'none',
    color: '#ef4444',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  main: {
    flexGrow: 1,
    padding: '40px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    textAlign: 'left',
    overflowX: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border)',
    paddingBottom: '24px',
  },
  welcomeSection: {},
  welcomeTitle: {
    margin: 0,
    fontSize: '32px',
    fontWeight: '700',
    color: 'var(--text-h)',
    letterSpacing: '-0.8px',
  },
  welcomeSub: {
    margin: '4px 0 0 0',
    fontSize: '15px',
    color: 'var(--text)',
  },
  rightHeaderControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  syncBtn: {
    background: 'var(--code-bg)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    padding: '10px',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s, transform 0.2s',
  },
  userInfoCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    background: 'var(--code-bg)',
    padding: '8px 16px',
    borderRadius: '30px',
    border: '1px solid var(--border)',
  },
  userInfoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  infoIcon: {
    color: 'var(--text)',
  },
  infoText: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-h)',
  },
  roleBadge: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.5px',
  },
  successAlert: {
    background: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    borderRadius: '8px',
    padding: '14px 18px',
  },
  successText: {
    margin: 0,
    color: '#22c55e',
    fontSize: '14px',
    fontWeight: '600',
  },
  errorAlert: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    padding: '14px 18px',
  },
  errorText: {
    margin: 0,
    color: '#ef4444',
    fontSize: '14px',
    fontWeight: '600',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
  },
  kpiCard: {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: 'var(--shadow)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  kpiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kpiTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text)',
  },
  kpiValue: {
    fontSize: '36px',
    fontWeight: '800',
    color: 'var(--text-h)',
    lineHeight: '1',
  },
  kpiFooter: {
    margin: 0,
    fontSize: '12px',
    color: 'var(--text)',
    opacity: 0.8,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
    gap: '24px',
  },
  profileCard: {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: 'var(--shadow)',
  },
  cardTitle: {
    margin: '0 0 20px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--text-h)',
  },
  profileDetailList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '12px',
    borderBottom: '1px solid var(--border)',
  },
  detailLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    color: 'var(--text)',
    fontWeight: '500',
  },
  detailVal: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-h)',
  },
  statusCard: {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: 'var(--shadow)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  statusContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    height: '100%',
    justifyContent: 'center',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(34, 197, 94, 0.12)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    color: '#22c55e',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    width: 'fit-content',
  },
  pulseDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#22c55e',
    boxShadow: '0 0 0 0 rgba(34, 197, 94, 0.7)',
    animation: 'pulse 1.8s infinite',
  },
  statusDesc: {
    margin: 0,
    fontSize: '14px',
    lineHeight: '1.5',
    color: 'var(--text)',
  },
  auditLogNotice: {
    background: 'var(--code-bg)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    padding: '10px 14px',
    fontSize: '13px',
    color: 'var(--text-h)',
  },
  stagingBanner: {
    background: 'radial-gradient(circle at bottom right, var(--accent-bg), transparent 60%), var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '28px',
    boxShadow: 'var(--shadow)',
  },
  stagingTitle: {
    margin: '0 0 24px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--text-h)',
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    position: 'relative',
    paddingLeft: '16px',
  },
  timelineNode: {
    display: 'flex',
    gap: '16px',
    position: 'relative',
    opacity: 0.5,
  },
  nodeDone: {
    opacity: 1,
  },
  nodeNext: {
    opacity: 1,
  },
  nodePoint: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'var(--code-bg)',
    border: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
    flexShrink: 0,
    color: 'var(--text)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  nodeContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  nodeTitle: {
    margin: 0,
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--text-h)',
  },
  nodeDesc: {
    margin: 0,
    fontSize: '13px',
    color: 'var(--text)',
  },
  panelContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  panelTabs: {
    display: 'flex',
    borderBottom: '1px solid var(--border)',
    gap: '8px',
    overflowX: 'auto',
  },
  tabButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    border: 'none',
    background: 'none',
    color: 'var(--text)',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'color 0.2s',
    borderBottom: '2px solid transparent',
    whiteSpace: 'nowrap',
  },
  activeTabButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    border: 'none',
    background: 'none',
    color: 'var(--accent)',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    borderBottom: '2px solid var(--accent)',
    whiteSpace: 'nowrap',
  },
  filterDeck: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flexGrow: 1,
    maxWidth: '480px',
  },
  searchIcon: {
    position: 'absolute',
    left: '14px',
    color: 'var(--text)',
    opacity: 0.7,
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px 12px 42px',
    fontSize: '14px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--bg)',
    color: 'var(--text-h)',
    outline: 'none',
  },
  filterSelect: {
    padding: '12px 16px',
    fontSize: '14px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--bg)',
    color: 'var(--text-h)',
    outline: 'none',
    cursor: 'pointer',
  },
  tabContentCard: {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    boxShadow: 'var(--shadow)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  tableActionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  tableTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--text-h)',
  },
  actionAddBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(170, 59, 255, 0.3)',
    transition: 'transform 0.1s ease',
  },
  slideForm: {
    background: 'var(--code-bg)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    animation: 'slideDown 0.3s ease',
  },
  formTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text-h)',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
    }
  },
  formField: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'start',
    gap: '6px',
  },
  formLabel: {
    fontSize: '13px',
    fontWeight: '500',
    color: 'var(--text-h)',
  },
  formInput: {
    width: '100%',
    padding: '10px 14px',
    fontSize: '14px',
    borderRadius: '6px',
    border: '1px solid var(--border)',
    background: 'var(--bg)',
    color: 'var(--text-h)',
    outline: 'none',
    boxSizing: 'border-box',
  },
  formSelect: {
    width: '100%',
    padding: '10px 14px',
    fontSize: '14px',
    borderRadius: '6px',
    border: '1px solid var(--border)',
    background: 'var(--bg)',
    color: 'var(--text-h)',
    outline: 'none',
    boxSizing: 'border-box',
    cursor: 'pointer',
  },
  formTextarea: {
    width: '100%',
    height: '80px',
    padding: '10px 14px',
    fontSize: '14px',
    borderRadius: '6px',
    border: '1px solid var(--border)',
    background: 'var(--bg)',
    color: 'var(--text-h)',
    outline: 'none',
    boxSizing: 'border-box',
    resize: 'none',
  },
  formActionButtons: {
    display: 'flex',
    gap: '12px',
  },
  formSubmitBtn: {
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  formCancelBtn: {
    background: 'none',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    padding: '10px 20px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  loaderDeck: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 24px',
    gap: '16px',
    color: 'var(--text)',
  },
  emptyDeck: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 24px',
    gap: '16px',
    color: 'var(--text)',
    textAlign: 'center',
  },
  successDeck: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 24px',
    color: 'var(--text)',
    textAlign: 'center',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '14px',
  },
  skuBadge: {
    background: 'var(--code-bg)',
    border: '1px solid var(--border)',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    color: 'var(--text-h)',
    fontWeight: '600',
  },
  categoryBadge: {
    background: 'var(--accent-bg)',
    color: 'var(--accent)',
    padding: '4px 10px',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: '500',
  },
  thresholdBadge: {
    background: 'rgba(245, 158, 11, 0.1)',
    color: '#f59e0b',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    padding: '4px 10px',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: '600',
  },
  coordBadge: {
    background: 'var(--code-bg)',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    border: '1px solid var(--border)',
  },
  stockCountBadge: {
    background: 'rgba(59, 130, 246, 0.1)',
    color: '#3b82f6',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    padding: '4px 10px',
    borderRadius: '16px',
    fontSize: '13px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  lowStockCountBadge: {
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    padding: '4px 10px',
    borderRadius: '16px',
    fontSize: '13px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  stockProductCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    alignItems: 'start',
  },
  stockProductName: {
    fontWeight: '600',
    color: 'var(--text-h)',
  },
  descCol: {
    maxWidth: '240px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  tableActions: {
    display: 'flex',
    gap: '8px',
  },
  editIconBtn: {
    background: 'none',
    border: 'none',
    color: '#3b82f6',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '4px',
    transition: 'background 0.2s',
  },
  deleteIconBtn: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '4px',
    transition: 'background 0.2s',
  },
  simNoticeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'var(--accent-bg)',
    color: 'var(--accent)',
    border: '1px solid var(--accent-border)',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
  },
  alertNoticeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
  },
  transactionFormContainer: {
    background: 'var(--code-bg)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inboundLabel: {
    background: 'rgba(34, 197, 94, 0.1)',
    color: '#22c55e',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '700',
  },
  outboundLabel: {
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '700',
  },
  transferLabel: {
    background: 'rgba(59, 130, 246, 0.1)',
    color: '#3b82f6',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '700',
  },
  operatorCol: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: 'var(--text-h)',
    fontWeight: '500',
  },
  criticalLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: '#ef4444',
    fontSize: '12px',
    fontWeight: '700',
  },
  quickRestockBtn: {
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(170, 59, 255, 0.2)',
  }
};

// Add standard keyframe and focus style effects
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = `
    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
      }
      70% {
        box-shadow: 0 0 0 6px rgba(34, 197, 94, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
      }
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .spinning {
      animation: spin 1.2s linear infinite;
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .node-line {
      position: absolute;
      left: 13px;
      top: 28px;
      bottom: -20px;
      width: 2px;
      background: var(--border);
    }
    th, td {
      border-bottom: 1px solid var(--border);
      padding: 14px 16px;
    }
    tr:hover {
      background: var(--code-bg);
    }
    input:focus, select:focus, textarea:focus {
      border-color: var(--accent) !important;
      box-shadow: 0 0 0 3px var(--accent-bg) !important;
    }
    button:hover:not(:disabled) {
      filter: brightness(1.05);
    }
    button:active:not(:disabled) {
      transform: scale(0.98);
    }
    @keyframes scan {
      0% { top: 5%; }
      50% { top: 95%; }
      100% { top: 5%; }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    div[style*="box-shadow"], div[style*="boxShadow"] {
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }
    div[style*="box-shadow"]:hover, div[style*="boxShadow"]:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow), 0 12px 20px -5px rgba(0, 0, 0, 0.1) !important;
    }
  `;
  document.head.appendChild(styleSheet);
}

export default Dashboard;
