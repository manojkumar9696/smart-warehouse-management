const https = require('https');
const db = require('../config/db');
const AIForecastService = require('../services/aiForecastService');

const callGeminiAPI = (apiKey, systemPrompt, contents) => {
  return new Promise((resolve, reject) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const payload = JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: contents
    });

    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const responseJson = JSON.parse(data);
          if (responseJson.candidates && responseJson.candidates[0]?.content?.parts?.[0]?.text) {
            resolve(responseJson.candidates[0].content.parts[0].text);
          } else {
            reject(new Error(responseJson.error?.message || 'Unexpected Gemini response structure'));
          }
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', err => { reject(err); });
    req.write(payload);
    req.end();
  });
};

const aiController = {
  getForecastAnalytics: async (req, res, next) => {
    try {
      const data = await AIForecastService.generateForecastReport();
      return res.status(200).json({
        success: true,
        data: data
      });
    } catch (err) {
      next(err);
    }
  },

  handleAssistantChat: async (req, res, next) => {
    try {
      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ success: false, message: 'Message is required' });
      }

      // 1. Fetch system state
      const [items] = await db.query('SELECT * FROM items');
      const [warehouses] = await db.query('SELECT * FROM warehouses');
      const [stockLines] = await db.query(`
        SELECT inventory.*, items.name AS item_name, items.sku AS item_sku, warehouses.name AS warehouse_name
        FROM inventory
        INNER JOIN items ON inventory.item_id = items.id
        INNER JOIN warehouses ON inventory.warehouse_id = warehouses.id
      `);

      // Get calculations from forecasting service
      const forecastReport = await AIForecastService.generateForecastReport();
      const { forecasts, anomalies } = forecastReport;

      // 2. Check for Gemini Key
      const apiKey = process.env.GEMINI_API_KEY;

      if (apiKey && apiKey !== 'your_jwt_secret_key_here') {
        const systemPrompt = `You are Antigravity AI, the intelligent manager assistant for a Smart Warehouse Management system.
Your goal is to answer queries with actual live inventory context. Keep your replies professional, precise, and concise.

Live Warehouse Data:
- Hubs: ${warehouses.map(w => `${w.name} (${w.location})`).join(', ')}
- Products registered: ${items.map(i => `${i.name} (SKU: ${i.sku}, Threshold: ${i.min_threshold})`).join(', ')}
- Physical Stock placements: ${stockLines.map(s => `${s.item_name} at ${s.warehouse_name} (Qty: ${s.quantity}, Rack: ${s.rack || 'N/A'}, Shelf: ${s.shelf || 'N/A'}, Bin: ${s.bin || 'N/A'})`).join(', ')}

Predictive AI Metrics:
${forecasts.map(f => `- ${f.name} (${f.sku}): Stock: ${f.current_stock}, Velocity: ${f.daily_velocity}/day, ROP: ${f.reorder_point}, Seasonal factor: ${f.seasonal_factor}x, Predicted demand: ${f.predicted_demand}, Suggestion: ${f.status} (Order: ${f.recommendation})`).join('\n')}

Flagged Outlier Anomalies:
${anomalies.map(a => `- Spike of ${a.quantity} units for ${a.item_name} (${a.deviation}σ deviation)`).join('\n')}

Instructions:
- Address the user's specific questions regarding stock levels, locations, reorder points, seasonal multipliers, or anomalies.
- If they ask for recommendations, suggest specific quantities to buy based on the "ORDER: X" stats.
- Keep the tone helpful, direct, and factual. Use markdown bullets for lists.`;

        // Prepare history for Gemini contents
        const contents = [];
        if (history && Array.isArray(history)) {
          history.forEach(h => {
            contents.push({
              role: h.sender === 'user' ? 'user' : 'model',
              parts: [{ text: h.text }]
            });
          });
        }
        contents.push({
          role: 'user',
          parts: [{ text: message }]
        });

        try {
          const responseText = await callGeminiAPI(apiKey, systemPrompt, contents);
          return res.status(200).json({
            success: true,
            reply: responseText
          });
        } catch (apiErr) {
          console.error('Gemini API call failed, falling back to local processor:', apiErr.message);
        }
      }

      // Local Rule-Based NLP Processor
      const text = message.toLowerCase();
      let reply = '';

      if (text.includes('low') || text.includes('alert') || text.includes('depleted') || text.includes('critical')) {
        const lowStockItems = forecasts.filter(f => f.status === 'RESTOCK_RECOMMENDED');
        if (lowStockItems.length === 0) {
          reply = 'I scanned all warehouse bays and active shelves. Good news! **All product balances are currently safe** and sitting comfortably above their configured reorder points.';
        } else {
          reply = `I have flagged **${lowStockItems.length} products** falling below their optimal reorder thresholds. Immediate replenishment is suggested:\n\n` +
            lowStockItems.map(f => `- **${f.name}** (SKU: \`${f.sku}\`): Current Stock: **${f.current_stock} units** (Reorder Point: ${f.reorder_point} units). Recommended procurement order: **${f.recommendation} units**.`).join('\n');
        }
      } else if (text.includes('recommend') || text.includes('procure') || text.includes('restock') || text.includes('order')) {
        const orderList = forecasts.filter(f => f.recommendation > 0);
        if (orderList.length === 0) {
          reply = 'My statistical model suggests that no purchase orders are required right now. All SKU quantities are sufficient to meet predicted seasonal monthly demand.';
        } else {
          reply = 'Here are my AI procurement and restock order recommendations to meet seasonal monthly demand curves:\n\n' +
            orderList.map(f => `- **${f.name}** (SKU: \`${f.sku}\`): Purchase **${f.recommendation} units** (predicted monthly demand: ${f.predicted_demand} units, seasonal factor: ${f.seasonal_factor.toFixed(2)}x).`).join('\n');
        }
      } else if (text.includes('anomaly') || text.includes('outlier') || text.includes('spike')) {
        if (anomalies.length === 0) {
          reply = 'I completed a standard deviation audit across all chronological transaction ledger entries. **No statistical outliers or suspicious sales spikes were found** within the current historical logs.';
        } else {
          reply = `I identified **${anomalies.length} statistical sales spikes** deviating from standard average transaction sizes:\n\n` +
            anomalies.map(a => `- **${a.item_name}** (SKU: \`${a.item_sku}\`): Outbound order size of **${a.quantity} units** represented a **${a.deviation.toFixed(1)}σ deviation spike** (Average transaction size: ${a.avg_size} units) on ${new Date(a.transaction_date).toLocaleDateString()}.`).join('\n');
        }
      } else if (text.includes('mango') || text.includes('fruit') || text.includes('box')) {
        const mango = forecasts.find(f => f.name.toLowerCase().includes('mango'));
        if (mango) {
          const placements = stockLines.filter(s => s.item_id === mango.id);
          const placementDetail = placements.length > 0
            ? placements.map(p => `located at **${p.warehouse_name}** (Rack: \`${p.rack || 'N/A'}\`, Shelf: \`${p.shelf || 'N/A'}\`, Bin: \`${p.bin || 'N/A'}\`)`).join(', ')
            : 'with no physical shelf allocations recorded';
          
          reply = `Here is the current operational audit for **${mango.name}**:\n\n` +
            `- **Current stock balance:** ${mango.current_stock} units (${placementDetail}).\n` +
            `- **Daily velocity:** ${mango.daily_velocity} units/day.\n` +
            `- **Optimal reorder point:** ${mango.reorder_point} units (Lead Time: 5 days, Threshold: 15).\n` +
            `- **Summer Seasonal Factor:** ${mango.seasonal_factor.toFixed(2)}x multiplier.\n` +
            `- **Procurement Status:** ${mango.status === 'RESTOCK_RECOMMENDED' ? `🚨 **RESTOCK SUGGESTED** (Order +${mango.recommendation} units)` : '✅ SAFE'}.`;
        } else {
          reply = 'I searched the product catalog but could not locate any active SKU matching "mango". Check if the product has been created in the Products Catalog.';
        }
      } else if (text.includes('warehouse') || text.includes('location') || text.includes('bay') || text.includes('cold')) {
        reply = `The system is currently managing **${warehouses.length} physical warehouse centers**:\n\n` +
          warehouses.map(w => {
            const whStocks = stockLines.filter(s => s.warehouse_id === w.id);
            const totalUnits = whStocks.reduce((sum, s) => sum + s.quantity, 0);
            return `- **${w.name}** (${w.location}): housing **${totalUnits} total units** across ${whStocks.length} allocated shelf lines.`;
          }).join('\n');
      } else {
        reply = `Hello! I am your SmartWarehouse AI Manager Assistant. 

I have real-time access to the database metrics and predictive forecasting logs. Ask me things like:
- "Show low stock warnings" (analyzes safety levels)
- "Recommend restocking orders" (calculates procurement buy logs)
- "Audit sales anomalies" (flags standard deviation outlier spikes)
- "Check Mango details" (provides product audit & rack coordinate status)
- "List warehouse centers" (summarizes warehouse hubs)

*Tip: Connect a valid \`GEMINI_API_KEY\` in your backend \`.env\` configuration to unlock full, free-form natural language capabilities!*`;
      }

      return res.status(200).json({
        success: true,
        reply: reply
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = aiController;
