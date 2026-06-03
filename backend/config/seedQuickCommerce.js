const db = require('./db');

async function seedQuickCommerce() {
  try {
    console.log("🚀 Starting Quick Commerce (Zepto/Blinkit) Realistic Seeding...");

    // Disable Foreign Key checks for clean wiping
    await db.query('SET FOREIGN_KEY_CHECKS = 0;');
    console.log("✓ Disabled foreign key constraints.");

    // 1. Wipe Old Data (except users & audit logs)
    await db.query('TRUNCATE TABLE transactions;');
    await db.query('TRUNCATE TABLE inventory;');
    await db.query('TRUNCATE TABLE items;');
    await db.query('TRUNCATE TABLE categories;');
    await db.query('TRUNCATE TABLE warehouses;');
    console.log("✓ Cleared old transactions, inventory, items, categories, and warehouses tables.");

    // 2. Query a User to associate with transactions
    const [users] = await db.query('SELECT id FROM users LIMIT 1;');
    const userId = users.length > 0 ? users[0].id : null;
    console.log(`✓ Associated transaction operator user ID: ${userId || 'None (Logged as system)'}`);

    // 3. Create Quick-Commerce Darkstore Warehouses
    console.log("\n[1] Seeding Zepto & Blinkit Dark Store Warehouses...");
    const warehouseData = [
      { name: "Zepto Darkstore - Bandra West (BUM-1)", location: "Plot 42, Hill Road, Bandra, Mumbai" },
      { name: "Blinkit Darkstore - Gurgaon Sec-45 (GGN-3)", location: "Building 18, Sector 45, Gurgaon, Haryana" },
      { name: "Zepto Darkstore - Indiranagar (BLR-2)", location: "100 Ft Rd, Stage 2, Indiranagar, Bangalore" },
      { name: "Blinkit Darkstore - Delhi Karol Bagh (DEL-1)", location: "Pusa Rd, Block 8, Karol Bagh, Delhi" }
    ];

    const warehouseIds = [];
    for (let wh of warehouseData) {
      const [res] = await db.query('INSERT INTO warehouses (name, location) VALUES (?, ?)', [wh.name, wh.location]);
      warehouseIds.push(res.insertId);
      console.log(`  ➔ Seeded Darkstore: ${wh.name} (ID: ${res.insertId})`);
    }

    // 4. Create Quick-Commerce Category Clustering
    console.log("\n[2] Seeding Category Clusters...");
    const categoriesData = [
      "Fresh Fruits & Vegetables",
      "Dairy, Bread & Eggs",
      "Munchies & Crispy Snacks",
      "Beverages & Cold Drinks",
      "Instant Meals & Noodles",
      "Household Essentials"
    ];

    const categoryIds = [];
    for (let catName of categoriesData) {
      const [res] = await db.query('INSERT INTO categories (name) VALUES (?)', [catName]);
      categoryIds.push(res.insertId);
      console.log(`  ➔ Seeded Category: ${catName} (ID: ${res.insertId})`);
    }

    // 5. Create Fast-Moving Quick-Commerce Products (Items)
    console.log("\n[3] Seeding Quick-Commerce Product Catalog...");
    const productsData = [
      // Category 0: Fruits & Vegetables
      { name: "Alphonso Mango (Box of 6)", sku: "FRU-ALPH-MANGO", category_id: categoryIds[0], price: 12.99, min_threshold: 40, description: "Sweet premium Alphonsos from Ratnagiri farms." },
      { name: "Fresh Robusta Bananas (1 Dozen)", sku: "FRU-BANANA-DOZ", category_id: categoryIds[0], price: 1.99, min_threshold: 50, description: "Naturally ripened Robusta bananas." },
      { name: "Fresh Red Onions (5kg Pack)", sku: "VEG-ONION-5KG", category_id: categoryIds[0], price: 3.49, min_threshold: 40, description: "Grade-A quality pink storage onions." },
      { name: "Hybrid Red Tomatoes (1kg)", sku: "VEG-TOMATO-1KG", category_id: categoryIds[0], price: 1.49, min_threshold: 40, description: "Plump local farm-picked tomatoes." },

      // Category 1: Dairy, Bread & Eggs
      { name: "Amul Pasteurised Butter (500g)", sku: "DY-AMUL-BUTTER", category_id: categoryIds[1], price: 3.29, min_threshold: 35, description: "Classic salted butter from Amul India." },
      { name: "Mother Dairy Full Cream Milk (1L)", sku: "DY-MILK-FULL1L", category_id: categoryIds[1], price: 0.89, min_threshold: 60, description: "Pasteurised fresh high-fat milk." },
      { name: "Harvest Gold Sliced Brown Bread (450g)", sku: "DY-BREAD-BROWN", category_id: categoryIds[1], price: 1.19, min_threshold: 30, description: "100% whole wheat sliced sandwich bread." },
      { name: "Organic Farm-Fresh Eggs (Pack of 30)", sku: "DY-EGGS-30P", category_id: categoryIds[1], price: 4.99, min_threshold: 25, description: "Antibiotic-free organic brown table eggs." },

      // Category 2: Munchies & Snacks
      { name: "Lays Potato Chips Classic Salted (150g)", sku: "SNK-LAYS-CLASSIC", category_id: categoryIds[2], price: 1.29, min_threshold: 80, description: "Crispy salted potato chips pack." },
      { name: "Kurkure Masala Munch (120g)", sku: "SNK-KURKURE-MM", category_id: categoryIds[2], price: 0.99, min_threshold: 80, description: "Spicy and crunchy corn snacks." },
      { name: "Haldirams Bhujia Sev (350g)", sku: "SNK-HALDIRAM-SEV", category_id: categoryIds[2], price: 2.49, min_threshold: 45, description: "Authentic spicy moth bean flour noodles." },

      // Category 3: Beverages
      { name: "Coca-Cola Original Taste (2L)", sku: "BEV-COKE-2L", category_id: categoryIds[3], price: 1.89, min_threshold: 50, description: "Sparkling sweet cold drink bottle." },
      { name: "Paper Boat Fresh Aam Panna (250ml)", sku: "BEV-PBOAT-AAM", category_id: categoryIds[3], price: 0.79, min_threshold: 40, description: "Tangy Indian green mango summer drink." },
      { name: "Red Bull Energy Drink (4-Pack)", sku: "BEV-RBULL-4P", category_id: categoryIds[3], price: 7.99, min_threshold: 30, description: "Energy boost taurine beverages." },

      // Category 4: Instant Meals
      { name: "Maggi 2-Minute Masala Noodles (12-Pack)", sku: "MAG-MAGGI-12P", category_id: categoryIds[4], price: 3.99, min_threshold: 50, description: "Instant favorite comfort foods pack." },
      { name: "Ching's Secret Hot Garlic Noodles (Pack)", sku: "MAG-CHINGS-GAR", category_id: categoryIds[4], price: 0.89, min_threshold: 40, description: "Spicy Schezwan garlic noodles." },

      // Category 5: Household Essentials
      { name: "Surf Excel Easy Wash Detergent (1kg)", sku: "HSE-SURF-1KG", category_id: categoryIds[5], price: 5.49, min_threshold: 20, description: "Whiteness retaining powder detergent." },
      { name: "Vim Liquid Dishwash Gel Lemon (500ml)", sku: "HSE-VIM-DISHLQ", category_id: categoryIds[5], price: 2.19, min_threshold: 25, description: "Grease cutting lemon fragrance dishwash gel." }
    ];

    const itemIds = [];
    const itemSkus = {};
    for (let prod of productsData) {
      const [res] = await db.query(
        'INSERT INTO items (name, sku, category_id, price, min_threshold, description) VALUES (?, ?, ?, ?, ?, ?)',
        [prod.name, prod.sku, prod.category_id, prod.price, prod.min_threshold, prod.description]
      );
      itemIds.push(res.insertId);
      itemSkus[prod.sku] = res.insertId;
      console.log(`  ➔ Seeded Product: ${prod.name} [SKU: ${prod.sku}] (ID: ${res.insertId})`);
    }

    // 6. Seed Stock placements (Inventory) & Rack coordinates
    // Assign products to Zepto Bandra (WH 1) and Blinkit Gurgaon (WH 2)
    console.log("\n[4] Allocating Inventory Balances & Picking Locations (Racks/Shelves/Bins)...");
    const stockPlacements = [
      // Zepto Darkstore - Bandra West (BUM-1)
      { item_id: itemSkus["FRU-ALPH-MANGO"], wh_id: warehouseIds[0], qty: 15, rack: "A-Zone", shelf: "Shelf 1", bin: "Bin 12" }, // Low Stock! (threshold 40)
      { item_id: itemSkus["FRU-BANANA-DOZ"], wh_id: warehouseIds[0], qty: 95, rack: "A-Zone", shelf: "Shelf 1", bin: "Bin 14" },
      { item_id: itemSkus["VEG-ONION-5KG"], wh_id: warehouseIds[0], qty: 110, rack: "A-Zone", shelf: "Shelf 2", bin: "Bin 01" },
      { item_id: itemSkus["VEG-TOMATO-1KG"], wh_id: warehouseIds[0], qty: 120, rack: "A-Zone", shelf: "Shelf 2", bin: "Bin 05" },
      { item_id: itemSkus["DY-MILK-FULL1L"], wh_id: warehouseIds[0], qty: 25, rack: "Cold-Room B", shelf: "Shelf A", bin: "Bin 08" }, // Low Stock! (threshold 60)
      { item_id: itemSkus["DY-AMUL-BUTTER"], wh_id: warehouseIds[0], qty: 85, rack: "Cold-Room B", shelf: "Shelf B", bin: "Bin 11" },
      { item_id: itemSkus["DY-BREAD-BROWN"], wh_id: warehouseIds[0], qty: 12, rack: "B-Zone", shelf: "Shelf 1", bin: "Bin 02" }, // Low Stock! (threshold 30)
      { item_id: itemSkus["SNK-LAYS-CLASSIC"], wh_id: warehouseIds[0], qty: 220, rack: "C-Zone", shelf: "Shelf 3", bin: "Bin 18" },
      { item_id: itemSkus["BEV-COKE-2L"], wh_id: warehouseIds[0], qty: 140, rack: "C-Zone", shelf: "Shelf 4", bin: "Bin 22" },
      { item_id: itemSkus["MAG-MAGGI-12P"], wh_id: warehouseIds[0], qty: 13, rack: "D-Zone", shelf: "Shelf 2", bin: "Bin 04" }, // Low Stock! (threshold 50)
      { item_id: itemSkus["HSE-SURF-1KG"], wh_id: warehouseIds[0], qty: 45, rack: "E-Zone", shelf: "Shelf 1", bin: "Bin 07" },

      // Blinkit Darkstore - Gurgaon Sec-45 (GGN-3)
      { item_id: itemSkus["FRU-ALPH-MANGO"], wh_id: warehouseIds[1], qty: 120, rack: "B-Zone", shelf: "Level 1", bin: "Bin 09" },
      { item_id: itemSkus["DY-MILK-FULL1L"], wh_id: warehouseIds[1], qty: 15, rack: "Cold-Room A", shelf: "Level 2", bin: "Bin 03" }, // Low Stock! (threshold 60)
      { item_id: itemSkus["DY-BREAD-BROWN"], wh_id: warehouseIds[1], qty: 95, rack: "D-Zone", shelf: "Level 1", bin: "Bin 17" },
      { item_id: itemSkus["SNK-LAYS-CLASSIC"], wh_id: warehouseIds[1], qty: 310, rack: "C-Zone", shelf: "Level 3", bin: "Bin 29" },
      { item_id: itemSkus["SNK-KURKURE-MM"], wh_id: warehouseIds[1], qty: 250, rack: "C-Zone", shelf: "Level 3", bin: "Bin 30" },
      { item_id: itemSkus["MAG-MAGGI-12P"], wh_id: warehouseIds[1], qty: 180, rack: "E-Zone", shelf: "Level 2", bin: "Bin 02" },
      { item_id: itemSkus["BEV-RBULL-4P"], wh_id: warehouseIds[1], qty: 12, rack: "C-Zone", shelf: "Level 4", bin: "Bin 15" } // Low Stock! (threshold 30)
    ];

    for (let st of stockPlacements) {
      await db.query(
        'INSERT INTO inventory (item_id, warehouse_id, quantity, rack, shelf, bin) VALUES (?, ?, ?, ?, ?, ?)',
        [st.item_id, st.wh_id, st.qty, st.rack, st.shelf, st.bin]
      );
    }
    console.log(`✓ Seeded ${stockPlacements.length} stock location balance assignments.`);

    // 7. Seed Transaction Ledger history logs
    // Seed high-frequency transactions to calculate realistic velocities
    console.log("\n[5] Seeding Transactional Ledger Trails & sales spikes for AI Analytics...");
    const transactionsData = [
      // 1. Alphonso Mangoes at Bandra Store: Seed Outbounds to calculate velocity
      // Outbounds: 10, 12, 14, 8, and a huge wholesale order spike of 75 units (outlier!)
      { item: "FRU-ALPH-MANGO", wh: warehouseIds[0], type: "inbound", qty: 200, notes: "Direct farm replenishment inbound" },
      { item: "FRU-ALPH-MANGO", wh: warehouseIds[0], type: "outbound", qty: 10, notes: "Order #ZEP-84192" },
      { item: "FRU-ALPH-MANGO", wh: warehouseIds[0], type: "outbound", qty: 12, notes: "Order #ZEP-84195" },
      { item: "FRU-ALPH-MANGO", wh: warehouseIds[0], type: "outbound", qty: 14, notes: "Order #ZEP-84201" },
      { item: "FRU-ALPH-MANGO", wh: warehouseIds[0], type: "outbound", qty: 8, notes: "Order #ZEP-84220" },
      { item: "FRU-ALPH-MANGO", wh: warehouseIds[0], type: "outbound", qty: 75, notes: "Catering bulk party order (Spike outlier!)" }, // Z-score outlier!

      // 2. Fresh Milk at Bandra Store
      { item: "DY-MILK-FULL1L", wh: warehouseIds[0], type: "inbound", qty: 150, notes: "Morning dairy dispatch" },
      { item: "DY-MILK-FULL1L", wh: warehouseIds[0], type: "outbound", qty: 22, notes: "Order #ZEP-85001" },
      { item: "DY-MILK-FULL1L", wh: warehouseIds[0], type: "outbound", qty: 26, notes: "Order #ZEP-85009" },
      { item: "DY-MILK-FULL1L", wh: warehouseIds[0], type: "outbound", qty: 18, notes: "Order #ZEP-85012" },
      { item: "DY-MILK-FULL1L", wh: warehouseIds[0], type: "outbound", qty: 110, notes: "Bulk tea stall restocking order (Spike outlier!)" }, // Z-score outlier!

      // 3. Brown Bread at Bandra Store
      { item: "DY-BREAD-BROWN", wh: warehouseIds[0], type: "inbound", qty: 50, notes: "Daily bread factory inbound" },
      { item: "DY-BREAD-BROWN", wh: warehouseIds[0], type: "outbound", qty: 6, notes: "Breakfast hours dispatch" },
      { item: "DY-BREAD-BROWN", wh: warehouseIds[0], type: "outbound", qty: 8, notes: "Breakfast hours dispatch" },
      { item: "DY-BREAD-BROWN", wh: warehouseIds[0], type: "outbound", qty: 10, notes: "Evening snack rounds dispatch" },

      // 4. Coca Cola 2L at Bandra Store
      { item: "BEV-COKE-2L", wh: warehouseIds[0], type: "inbound", qty: 200, notes: "Coke warehouse distribution dispatch" },
      { item: "BEV-COKE-2L", wh: warehouseIds[0], type: "outbound", qty: 15, notes: "Weekend party munchies dispatch" },
      { item: "BEV-COKE-2L", wh: warehouseIds[0], type: "outbound", qty: 18, notes: "Weekend party munchies dispatch" },

      // 5. Classic Salted Lays at Gurgaon Store
      { item: "SNK-LAYS-CLASSIC", wh: warehouseIds[1], type: "inbound", qty: 400, notes: "Distributor snacks inbound stock" },
      { item: "SNK-LAYS-CLASSIC", wh: warehouseIds[1], type: "outbound", qty: 22, notes: "Order #BLI-91042" },
      { item: "SNK-LAYS-CLASSIC", wh: warehouseIds[1], type: "outbound", qty: 25, notes: "Order #BLI-91055" },
      { item: "SNK-LAYS-CLASSIC", wh: warehouseIds[1], type: "outbound", qty: 180, notes: "Screening event catering snacks order (Spike outlier!)" } // Z-score outlier!
    ];

    for (let tx of transactionsData) {
      const itemId = itemSkus[tx.item];
      // Convert inbound vs outbound quantity sign
      const quantityVal = tx.type === "outbound" ? -tx.qty : tx.qty;
      await db.query(
        'INSERT INTO transactions (item_id, warehouse_id, type, quantity, user_id, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [itemId, tx.wh, tx.type, quantityVal, userId, tx.notes]
      );
    }
    console.log(`✓ Seeded ${transactionsData.length} transaction ledger history points.`);

    // Re-enable Foreign Key constraints
    await db.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log("\n✓ Re-enabled foreign key constraints successfully.");
    console.log("🏆 Quick Commerce dark-store database seeding successfully COMPLETED!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Quick Commerce database seeding failed:", error);
    process.exit(1);
  }
}

seedQuickCommerce();
