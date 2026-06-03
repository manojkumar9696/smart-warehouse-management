const EmailService = {
  sendLowStockAlert: async (product, warehouse, currentQty, threshold) => {
    try {
      const emailHTML = `
=========================================
📧 SYSTEM ALERT: LOW STOCK NOTIFICATION
=========================================
To: procurement@smartwarehouse.com
Subject: [ALERT] Low Stock: ${product.name} at ${warehouse.name}

Dear Warehouse Manager,

This is an automated system notification to inform you that stock levels for
the following item have dropped below the designated minimum safety threshold.

Product Details:
----------------
Name: ${product.name}
SKU: ${product.sku}
Price: $${product.price}

Warehouse Details:
------------------
Name: ${warehouse.name}
Location: ${warehouse.location || 'N/A'}

Stock Balance:
--------------
Safety Threshold: ${threshold} units
Current Quantity: ${currentQty} units
Status: ORDER SUGGESTED

Please initiate replenishment procedures as soon as possible.
=========================================
`;
      console.log(emailHTML);
      return true;
    } catch (err) {
      console.error('Failed to dispatch low-stock email alert simulation:', err);
      return false;
    }
  }
};

module.exports = EmailService;
