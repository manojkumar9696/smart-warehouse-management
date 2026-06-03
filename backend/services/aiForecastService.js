const db = require('../config/db');

const AIForecastService = {
  generateForecastReport: async () => {
    // 1. Fetch all products, active stock lines, and outbound transactions
    const [items] = await db.query(`
      SELECT items.*, categories.name AS category_name 
      FROM items 
      LEFT JOIN categories ON items.category_id = categories.id
    `);
    const [stockLines] = await db.query('SELECT * FROM inventory');
    const [txLogs] = await db.query(`
      SELECT transactions.*, items.name AS item_name, items.sku AS item_sku
      FROM transactions
      INNER JOIN items ON transactions.item_id = items.id
      WHERE transactions.type = 'outbound'
      ORDER BY transactions.transaction_date ASC
    `);

    // 2. Map inventory quantities per product
    const inventoryMap = {};
    stockLines.forEach(line => {
      inventoryMap[line.item_id] = (inventoryMap[line.item_id] || 0) + line.quantity;
    });

    // 3. Compute Outbound Sales Velocities & standard deviations for anomaly checking
    const outboundsByItem = {};
    txLogs.forEach(tx => {
      if (!outboundsByItem[tx.item_id]) {
        outboundsByItem[tx.item_id] = [];
      }
      // Outbound quantities are recorded as negative in ledger, let's make it positive
      outboundsByItem[tx.item_id].push(Math.abs(tx.quantity));
    });

    const forecasts = [];
    const anomalies = [];

    // Safety Lead Time & standard safety margins
    const leadTimeDays = 5;

    for (const item of items) {
      const currentStock = inventoryMap[item.id] || 0;
      const threshold = item.min_threshold || 10;

      // 4. Calculate Sales Velocity (units/day)
      let velocity = 0;
      const txs = outboundsByItem[item.id] || [];

      if (txs.length >= 2) {
        // Compute velocity from timeline span
        const firstTx = txLogs.find(tx => tx.item_id === item.id);
        const lastTx = [...txLogs].reverse().find(tx => tx.item_id === item.id);
        const diffMs = new Date(lastTx.transaction_date) - new Date(firstTx.transaction_date);
        const diffDays = Math.max(1, diffMs / (1000 * 60 * 60 * 24));
        const totalQty = txs.reduce((sum, q) => sum + q, 0);
        velocity = totalQty / diffDays;
      }

      // If sparse velocity, inject extremely smart category baseline
      if (velocity <= 0.1) {
        const catName = (item.category_name || '').toLowerCase();
        if (catName.includes('grocery') || catName.includes('fruit') || catName.includes('food')) {
          velocity = 12.5; // High velocity grocery line
        } else if (catName.includes('electronics') || catName.includes('hardware')) {
          velocity = 4.2; // Electronics/hardware baseline
        } else {
          velocity = 6.0; // Standard default velocity
        }
      }

      // 5. Calculate Reorder Point (ROP)
      const reorderPoint = Math.ceil((velocity * leadTimeDays) + threshold);

      // 6. Calculate Seasonal Factor
      let seasonalFactor = 1.05;
      const catName = (item.category_name || '').toLowerCase();
      const itemName = item.name.toLowerCase();

      if (catName.includes('grocery') || catName.includes('fruit') || itemName.includes('mango')) {
        // High summer demand bump for tropical fruits / groceries
        seasonalFactor = 1.45;
      } else if (catName.includes('electronics') || catName.includes('tech')) {
        // Winter holiday season bump
        seasonalFactor = 1.30;
      }

      // 7. Calculate predicted demand
      const predictedMonthlyDemand = Math.ceil(velocity * seasonalFactor * 30);

      // 8. Calculate Purchase Recommendation
      const recommendation = Math.max(0, predictedMonthlyDemand - currentStock);

      forecasts.push({
        id: item.id,
        name: item.name,
        sku: item.sku,
        category: item.category_name || 'General',
        current_stock: currentStock,
        daily_velocity: parseFloat(velocity.toFixed(2)),
        reorder_point: reorderPoint,
        seasonal_factor: seasonalFactor,
        predicted_demand: predictedMonthlyDemand,
        recommendation: recommendation,
        status: currentStock <= reorderPoint ? 'RESTOCK_RECOMMENDED' : 'SAFE'
      });

      // 9. Standard Deviation Outlier Anomaly Detection
      if (txs.length >= 3) {
        const avg = txs.reduce((sum, q) => sum + q, 0) / txs.length;
        const variance = txs.reduce((sum, q) => sum + Math.pow(q - avg, 2), 0) / txs.length;
        const stdDev = Math.sqrt(variance);

        txLogs.filter(tx => tx.item_id === item.id).forEach(tx => {
          const qty = Math.abs(tx.quantity);
          const deviation = stdDev > 0 ? (qty - avg) / stdDev : 0;

          // If transaction quantity is greater than average by 1.5+ standard deviations, flag as outlier
          if (deviation >= 1.5) {
            anomalies.push({
              tx_id: tx.id,
              item_id: item.id,
              item_name: item.name,
              item_sku: item.sku,
              quantity: qty,
              transaction_date: tx.transaction_date,
              avg_size: parseFloat(avg.toFixed(2)),
              deviation: parseFloat(deviation.toFixed(2)),
              type: 'sales_spike'
            });
          }
        });
      }
    }

    return {
      forecasts,
      anomalies
    };
  }
};

module.exports = AIForecastService;
