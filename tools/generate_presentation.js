const pptxgen = require('pptxgenjs');
const path = require('path');

const pptx = new pptxgen();

// Set 16:9 Widescreen Layout
pptx.layout = 'LAYOUT_16x9';

// Colors (Design System Tokens)
const COLOR_DARK_BG = '0F172A'; // Slate 900
const COLOR_LIGHT_BG = 'F8FAFC'; // Slate 50
const COLOR_CARD_BG = 'FFFFFF';
const COLOR_BORDER = 'E2E8F0'; // Slate 200
const COLOR_TEXT_PRIMARY = '0F172A';
const COLOR_TEXT_MUTED = '64748B'; // Slate 500
const COLOR_ACCENT_PURPLE = 'AA3BFF'; // SmartWarehouse Purple Accent
const COLOR_ACCENT_BLUE = '3B82F6'; // Cool Blue
const COLOR_ACCENT_GREEN = '10B981'; // Success Green
const COLOR_ACCENT_RED = 'EF4444'; // Alert Red
const COLOR_ACCENT_ORANGE = 'F59E0B'; // Warning Orange

// Reusable Fonts
const FONT_FACE = 'Segoe UI';

// Helper: Add Title Slide (Dark Theme)
function addTitleSlide() {
  const slide = pptx.addSlide();
  slide.background = { color: COLOR_DARK_BG };

  // Decorative Accent Blocks
  slide.addShape(pptx.shapes.RECTANGLE, { fill: { color: COLOR_ACCENT_PURPLE }, x: 0, y: 0, w: 0.4, h: 7.5 });
  slide.addShape(pptx.shapes.RECTANGLE, { fill: { color: COLOR_ACCENT_BLUE }, x: 0.4, y: 0, w: 0.1, h: 7.5 });

  // Main Title
  slide.addText('SMART WAREHOUSE\nMANAGEMENT SYSTEM', {
    x: 1.2,
    y: 2.0,
    w: 11.0,
    h: 2.2,
    fontSize: 44,
    bold: true,
    color: 'FFFFFF',
    fontFace: FONT_FACE,
    lineSpacing: 48
  });

  // Subtitle
  slide.addText('Real-Time Stock Auditing, Location Placements, and AI-Driven Replenishment', {
    x: 1.2,
    y: 4.3,
    w: 11.0,
    h: 0.8,
    fontSize: 18,
    color: COLOR_ACCENT_PURPLE,
    fontFace: FONT_FACE
  });

  // Footer Metadata
  slide.addText('PREPARED FOR: EXECUTIVE OPERATIONS REVIEW\nSYSTEM: FULL-STACK ENTERPRISE STOCK CONTROL\nPOWERED BY: ANTIGRAVITY AI & GEMINI 2.5 FLASH', {
    x: 1.2,
    y: 5.6,
    w: 8.0,
    h: 1.2,
    fontSize: 11,
    color: '94A3B8',
    bold: true,
    fontFace: FONT_FACE,
    lineSpacing: 18
  });
}

// Helper: Add Section Divider Slide (Dark Theme)
function addSectionDividerSlide(title, subtitle) {
  const slide = pptx.addSlide();
  slide.background = { color: COLOR_DARK_BG };

  // Decorative accent line
  slide.addShape(pptx.shapes.RECTANGLE, { fill: { color: COLOR_ACCENT_PURPLE }, x: 0.8, y: 2.8, w: 4.0, h: 0.08 });

  slide.addText(title.toUpperCase(), {
    x: 0.8,
    y: 3.2,
    w: 11.5,
    h: 1.0,
    fontSize: 36,
    bold: true,
    color: 'FFFFFF',
    fontFace: FONT_FACE
  });

  slide.addText(subtitle, {
    x: 0.8,
    y: 4.2,
    w: 11.5,
    h: 1.0,
    fontSize: 18,
    color: '94A3B8',
    fontFace: FONT_FACE
  });
}

// Helper: Create Standard Content Slide (Light Theme)
function createSlide(title) {
  const slide = pptx.addSlide();
  slide.background = { color: COLOR_LIGHT_BG };

  // Header Title
  slide.addText(title.toUpperCase(), {
    x: 0.6,
    y: 0.4,
    w: 12.0,
    h: 0.6,
    fontSize: 24,
    bold: true,
    color: COLOR_TEXT_PRIMARY,
    fontFace: FONT_FACE
  });

  // Purple Divider Line under Title
  slide.addShape(pptx.shapes.RECTANGLE, { fill: { color: COLOR_ACCENT_PURPLE }, x: 0.6, y: 1.1, w: 12.13, h: 0.04 });

  // Page Footer line
  slide.addShape(pptx.shapes.RECTANGLE, { fill: { color: COLOR_BORDER }, x: 0.6, y: 6.9, w: 12.13, h: 0.02 });

  // Page Footer text
  slide.addText("Smart Warehouse Management System  |  Operational Executive Presentation", {
    x: 0.6,
    y: 7.0,
    w: 10.0,
    h: 0.3,
    fontSize: 9,
    color: COLOR_TEXT_MUTED,
    fontFace: FONT_FACE
  });

  return slide;
}

// Helper: Draw Bento Card with Bullet Points
function addCardWithBullets(slide, cardX, cardY, cardW, cardH, cardTitle, titleColor, bullets) {
  // Draw Card Container
  slide.addShape(pptx.shapes.RECTANGLE, {
    fill: { color: COLOR_CARD_BG },
    line: { color: COLOR_BORDER, width: 1 },
    x: cardX,
    y: cardY,
    w: cardW,
    h: cardH
  });

  // Add Card Title
  slide.addText(cardTitle.toUpperCase(), {
    x: cardX + 0.3,
    y: cardY + 0.3,
    w: cardW - 0.6,
    h: 0.4,
    fontSize: 15,
    bold: true,
    color: titleColor,
    fontFace: FONT_FACE
  });

  // Convert string bullets into text objects with spacing
  const textObjects = bullets.map((bulletText, index) => {
    return {
      text: bulletText + (index === bullets.length - 1 ? "" : "\n\n"),
      options: {
        bullet: true,
        color: COLOR_TEXT_PRIMARY,
        fontSize: 12,
        lineSpacing: 18,
        fontFace: FONT_FACE
      }
    };
  });

  // Add Bullets
  slide.addText(textObjects, {
    x: cardX + 0.3,
    y: cardY + 0.8,
    w: cardW - 0.6,
    h: cardH - 1.1,
    valign: 'top'
  });
}

// Build Presentation Slides
addTitleSlide();

// Slide 2: Project Overview & Objectives (2 Column Bento)
const slide2 = createSlide("Project Overview & Objectives");
addCardWithBullets(slide2, 0.6, 1.4, 5.8, 5.2, "Operational Challenges Solved", COLOR_ACCENT_RED, [
  "Inability to track real-time inventory levels across separate physical warehouse spaces, leading to catalog discrepancy.",
  "Manual, error-prone recording of physical shelf locations (Racks, Shelves, Bins), slowing down retrieval velocity.",
  "No audit ledger trails or session accountability for stock transfers and manual adjustments.",
  "Frequent stockouts of key consumer lines and costly over-stocking of slow-moving items due to lack of predictive demand insights."
]);
addCardWithBullets(slide2, 6.9, 1.4, 5.8, 5.2, "Intelligent Solution Benefits", COLOR_ACCENT_GREEN, [
  "Consolidated Digital Hub giving instant live quantity counts and layout visibility for managers.",
  "Precise 3D physical coordinates cataloged for every stock line to streamline warehouse employee routing.",
  "Immutable, chronological transaction ledgers mapping every stock increment, decrement, and transfer.",
  "Predictive restocking algorithms computing safety buffers and suggesting procurement buy orders automatically."
]);

// Slide 3: Core System Features (3 Column Bento)
const slide3 = createSlide("Core System Features");
addCardWithBullets(slide3, 0.6, 1.4, 3.8, 5.2, "Secure RBAC Gateway", COLOR_ACCENT_PURPLE, [
  "User Authentication: Custom JWT-token session management.",
  "Role-Based Access (RBAC): Differentiated screens for Admin, Manager, and Employee.",
  "Password Security: Hashed security barriers using bcryptjs.",
  "Route Guards: API security limiting modifications to approved manager roles."
]);
addCardWithBullets(slide3, 4.75, 1.4, 3.8, 5.2, "Shelf Placements", COLOR_ACCENT_BLUE, [
  "3D Coordinates: Map stock to specific Rack, Shelf, and Bin numbers.",
  "Multi-Warehouse Support: Catalog distinct inventory balances by physical hub centers.",
  "Instant Synchronization: Placements auto-update as ledger movements execute.",
  "Flexible Layouts: Easy updates for warehouse floor reorganization."
]);
addCardWithBullets(slide3, 8.9, 1.4, 3.8, 5.2, "Transaction Ledger", COLOR_ACCENT_GREEN, [
  "Movement Types: Record Inbound additions, Outbound shipments, and Internal Transfers.",
  "Chronological Ledger: Immutable audit trail listing timestamps and user details.",
  "Auto-Adjustments: Deducts from source and adds to destination hubs in a single step.",
  "Ledger Notes: Capture comments for tracking operational variances."
]);

// Slide 4: Technical Architecture & Stack (2x2 Grid Bento)
const slide4 = createSlide("System Architecture & Tech Stack");
addCardWithBullets(slide4, 0.6, 1.4, 5.8, 2.45, "Client Layer (Frontend)", COLOR_ACCENT_BLUE, [
  "Built with React 19, Vite (optimized build engine), Axios (HTTP Client), and Lucide React icons.",
  "Modular component architecture utilizing dynamic client-side Routing and Context-based Auth states."
]);
addCardWithBullets(slide4, 6.9, 1.4, 5.8, 2.45, "API Server Layer (Backend)", COLOR_ACCENT_PURPLE, [
  "Node.js & Express.js REST API with modular MVC layout (Routes, Controllers, Models, Services).",
  "Secured with JSON Web Token (JWT) header filters and payload validation middleware."
]);
addCardWithBullets(slide4, 0.6, 4.15, 5.8, 2.45, "Database Storage (MySQL)", COLOR_ACCENT_GREEN, [
  "Relational Schema containing Users, Warehouses, Categories, Items, Placements, and Transactions.",
  "Configured with cascading deletes, unique indexes, and JSON column audit fields."
]);
addCardWithBullets(slide4, 6.9, 4.15, 5.8, 2.45, "AI & Analytics Engine", COLOR_ACCENT_ORANGE, [
  "Google Gemini 2.5 Flash chatbot integration providing live, contextual data audits.",
  "Statistical algorithms assessing outlier sales spikes and calculating seasonal demand curves."
]);

// Slide 5: Database Schema Design (Styled Table Slide)
const slide5 = createSlide("Database Schema Design");
const tableHeaders = [
  { text: 'Table Name', options: { fill: { color: COLOR_DARK_BG }, color: 'FFFFFF', bold: true, fontSize: 12, fontFace: FONT_FACE } },
  { text: 'Core Attributes & Types', options: { fill: { color: COLOR_DARK_BG }, color: 'FFFFFF', bold: true, fontSize: 12, fontFace: FONT_FACE } },
  { text: 'Key Constraints', options: { fill: { color: COLOR_DARK_BG }, color: 'FFFFFF', bold: true, fontSize: 12, fontFace: FONT_FACE } },
  { text: 'Operational Purpose', options: { fill: { color: COLOR_DARK_BG }, color: 'FFFFFF', bold: true, fontSize: 12, fontFace: FONT_FACE } }
];
const tableRows = [
  [
    { text: 'users', options: { bold: true, fontFace: FONT_FACE } },
    { text: 'id (Int), username (Varchar), email (Varchar), password (Varchar), role (Enum)', options: { fontFace: FONT_FACE } },
    { text: 'PK: id, Unique: username/email', options: { color: COLOR_ACCENT_PURPLE, fontFace: FONT_FACE } },
    { text: 'Manages user credentials and Role-Based Access Control (RBAC).', options: { fontFace: FONT_FACE } }
  ],
  [
    { text: 'audit_logs', options: { bold: true, fontFace: FONT_FACE } },
    { text: 'id (Int), user_id (Int), action (Varchar), entity_type (Varchar), before_value (JSON), after_value (JSON)', options: { fontFace: FONT_FACE } },
    { text: 'PK: id, FK: user_id', options: { color: COLOR_ACCENT_PURPLE, fontFace: FONT_FACE } },
    { text: 'Security logs tracking pre- and post-modification states of all data objects.', options: { fontFace: FONT_FACE } }
  ],
  [
    { text: 'warehouses', options: { bold: true, fontFace: FONT_FACE } },
    { text: 'id (Int), name (Varchar), location (Varchar)', options: { fontFace: FONT_FACE } },
    { text: 'PK: id', options: { color: COLOR_ACCENT_PURPLE, fontFace: FONT_FACE } },
    { text: 'Represents physical distribution hubs housing regional inventory.', options: { fontFace: FONT_FACE } }
  ],
  [
    { text: 'items', options: { bold: true, fontFace: FONT_FACE } },
    { text: 'id (Int), name (Varchar), sku (Varchar), category_id (Int), price (Decimal), min_threshold (Int)', options: { fontFace: FONT_FACE } },
    { text: 'PK: id, FK: category_id, Unique: sku', options: { color: COLOR_ACCENT_PURPLE, fontFace: FONT_FACE } },
    { text: 'Global product catalog including minimum safety stock thresholds.', options: { fontFace: FONT_FACE } }
  ],
  [
    { text: 'inventory', options: { bold: true, fontFace: FONT_FACE } },
    { text: 'id (Int), item_id (Int), warehouse_id (Int), quantity (Int), rack (Varchar), shelf (Varchar), bin (Varchar)', options: { fontFace: FONT_FACE } },
    { text: 'PK: id, FK: item_id/warehouse_id, Unique: (item_id, warehouse_id)', options: { color: COLOR_ACCENT_PURPLE, fontFace: FONT_FACE } },
    { text: 'Maps current stock levels and 3D physical coordinates in warehouse bays.', options: { fontFace: FONT_FACE } }
  ],
  [
    { text: 'transactions', options: { bold: true, fontFace: FONT_FACE } },
    { text: 'id (Int), item_id (Int), warehouse_id (Int), type (Enum), quantity (Int), user_id (Int), notes (Text)', options: { fontFace: FONT_FACE } },
    { text: 'PK: id, FK: item_id/warehouse_id/user_id', options: { color: COLOR_ACCENT_PURPLE, fontFace: FONT_FACE } },
    { text: 'Immutable chronological ledger auditing stock additions, shipments, and transfers.', options: { fontFace: FONT_FACE } }
  ]
];

// Combine headers and rows
const fullTableData = [tableHeaders, ...tableRows];

// Apply styles to body rows (alternating backgrounds)
for (let i = 1; i < fullTableData.length; i++) {
  const rowBg = i % 2 === 0 ? 'F1F5F9' : 'FFFFFF';
  fullTableData[i].forEach(cell => {
    cell.options = cell.options || {};
    cell.options.fill = { color: rowBg };
    cell.options.fontSize = 10;
    cell.options.color = COLOR_TEXT_PRIMARY;
  });
}

slide5.addTable(fullTableData, {
  x: 0.6,
  y: 1.4,
  w: 12.13,
  h: 5.2,
  colW: [1.2, 3.5, 3.2, 4.23]
});

// Slide 6: Backend API & Controller Design (2 Column Bento)
const slide6 = createSlide("Backend API & Controller Design");
addCardWithBullets(slide6, 0.6, 1.4, 5.8, 5.2, "Core API Endpoint Routes", COLOR_ACCENT_PURPLE, [
  "Authentication: /api/auth/register and /api/auth/login handle token signature generation.",
  "Item Catalog: GET, POST, PUT, and DELETE routes under /api/items manage global products.",
  "Physical Stocking: /api/inventory/placement handles Rack/Shelf/Bin position edits.",
  "Logistics Ledger: /api/transactions/execute processes stock additions, deductions, and transfers atomically.",
  "Intelligent Support: /api/ai/forecast provides restocking math while /api/ai/chat manages chatbot text."
]);
addCardWithBullets(slide6, 6.9, 1.4, 5.8, 5.2, "MVC Transaction Execution Pattern", COLOR_ACCENT_BLUE, [
  "Controller Layer: Decoupled routing requests validate request bodies using express-validator prior to sql executions.",
  "Atomic Adjustments: Deducting inventory from one warehouse and adding to another is wrapped in structured SQL transactions to prevent database mismatch.",
  "Auto-Compliance: Every write action prompts an independent write to the audit_logs table, archiving the delta states.",
  "Centralized Middleware: Uniform try-catch handlers capture errors and route neat JSON payloads back to the frontend."
]);

// Slide 7: Frontend UI & User Experience (3 Column Bento)
const slide7 = createSlide("Frontend UI & User Experience");
addCardWithBullets(slide7, 0.6, 1.4, 3.8, 5.2, "Interactive Dashboard", COLOR_ACCENT_BLUE, [
  "Visual metrics tracking low stock thresholds.",
  "Clean list filters to slice stock data by SKU, Warehouse location, or Category group.",
  "Global loader icons indicating database read/write actions.",
  "Synchronized panels updating immediately when transactions execute."
]);
addCardWithBullets(slide7, 4.75, 1.4, 3.8, 5.2, "Seamless Operations", COLOR_ACCENT_PURPLE, [
  "Pop-up Dialog Modals: Add products, categories, or adjust warehouse placements easily.",
  "Inbound/Outbound forms featuring real-time input validation rules.",
  "Transfer modules preventing transfers exceeding available source balances.",
  "Simulated Barcode Scanner enabling mock camera input for quick SKU selections."
]);
addCardWithBullets(slide7, 8.9, 1.4, 3.8, 5.2, "AI Assistant Interface", COLOR_ACCENT_GREEN, [
  "Dedicated Sidebar Tab for AI-driven manager conversations.",
  "Auto-Scrolling Chat window showcasing clear user and system reply containers.",
  "Quick Prompt Buttons: Ask low-stock alerts, procurement lists, and transaction spikes in one click.",
  "Visual loading states showing when the LLM is calculating replies."
]);

// Slide 8: AI-Powered Demand Forecasting (2 Column Bento)
const slide8 = createSlide("AI-Powered Demand Forecasting");
addCardWithBullets(slide8, 0.6, 1.4, 5.8, 5.2, "Predictive Replenishment Logic", COLOR_ACCENT_PURPLE, [
  "Sales Velocity: Calculated dynamically as total outbound unit volume divided by elapsed ledger days.",
  "Category Baselines: Automated fallback rates (e.g. Groceries: 12.5 units/day, Electronics: 4.2 units/day) for new SKUs with short history.",
  "Reorder Point (ROP): Formula: (Sales Velocity * 5 Days Lead Time) + Category Threshold.",
  "Seasonal Multiplier: Dynamic demand multipliers adjusted by category (e.g. Summer bump of 1.45x for tropical fruits; Winter holiday bump of 1.30x for technology products)."
]);
addCardWithBullets(slide8, 6.9, 1.4, 5.8, 5.2, "Automated AI Recommendations", COLOR_ACCENT_GREEN, [
  "Predicted Demand: Calculates 30-day outlook utilizing the velocity and seasonal multiplier rates.",
  "Procurement Suggestions: Recommends exact buy-order volumes using formula: (Predicted Demand - Current Stock balance).",
  "Safety Flags: Marks item balances with RESTOCK_RECOMMENDED tags if active stock dips below calculated ROP levels.",
  "Executive Reports: Export features compile detailed replenishment sheets into PDF and CSV formats for purchase orders."
]);

// Slide 9: Security Audits & Anomaly Detection (2 Column Bento)
const slide9 = createSlide("Security & Anomaly Auditing");
addCardWithBullets(slide9, 0.6, 1.4, 5.8, 5.2, "Cryptographic Compliance Logs", COLOR_ACCENT_PURPLE, [
  "Database Triggers: Every stock modification writes a permanent entry to the audit_logs database ledger.",
  "State Archives: JSON columns capture before_value and after_value states, documenting exact field changes.",
  "Operator Tracking: Logs the user account responsible, timestamp, affected tables, and row IDs.",
  "Strict Immutability: Logs cannot be updated or deleted by normal application routes, providing audit compliance."
]);
addCardWithBullets(slide9, 6.9, 1.4, 5.8, 5.2, "Outlier Transaction Analytics", COLOR_ACCENT_RED, [
  "Statistical Auditing: System evaluates outbound transaction history using average quantity and standard deviation metrics.",
  "Spike Detection: Flags any outbound order size exceeding the historical average by 1.5+ standard deviations.",
  "Operational Alerts: Signals potential inventory shrinkage, bulk data errors, or unauthorized distribution actions.",
  "Contextual AI: Chatbot reads flagged outliers to answer manager audit queries with exact deviation metrics."
]);

// Slide 10: Conclusion & Future Roadmap (Dark Theme, Split Columns)
const slide10 = pptx.addSlide();
slide10.background = { color: COLOR_DARK_BG };

// Decorative Accent Blocks
slide10.addShape(pptx.shapes.RECTANGLE, { fill: { color: COLOR_ACCENT_PURPLE }, x: 0, y: 0, w: 0.4, h: 7.5 });
slide10.addShape(pptx.shapes.RECTANGLE, { fill: { color: COLOR_ACCENT_BLUE }, x: 0.4, y: 0, w: 0.1, h: 7.5 });

// Title
slide10.addText('CONCLUSION & FUTURE ROADMAP', {
  x: 1.2,
  y: 1.0,
  w: 11.0,
  h: 0.8,
  fontSize: 32,
  bold: true,
  color: 'FFFFFF',
  fontFace: FONT_FACE
});

// Left Column: Key Successes
const successesText = [
  { text: "KEY SUCCESSES\n\n", options: { bold: true, color: COLOR_ACCENT_PURPLE, fontSize: 16 } },
  { text: "• Secure Stock Platform: ", options: { bold: true, color: 'FFFFFF', fontSize: 13 } },
  { text: "Delivered active user session gates and role safeguards to secure inventory.\n\n", options: { color: 'E2E8F0', fontSize: 12 } },
  { text: "• Accurate Location Maps: ", options: { bold: true, color: 'FFFFFF', fontSize: 13 } },
  { text: "Simplified physical warehouse workflows using granular rack-shelf-bin tracking.\n\n", options: { color: 'E2E8F0', fontSize: 12 } },
  { text: "• Proactive AI Systems: ", options: { bold: true, color: 'FFFFFF', fontSize: 13 } },
  { text: "Reduced stockout risks and auditing time using predictive modeling and Gemini chatbot natural queries.", options: { color: 'E2E8F0', fontSize: 12 } }
];
slide10.addText(successesText, {
  x: 1.2,
  y: 2.2,
  w: 5.2,
  h: 4.5,
  valign: 'top',
  fontFace: FONT_FACE
});

// Right Column: Future Roadmap
const roadmapText = [
  { text: "FUTURE MILESTONES\n\n", options: { bold: true, color: COLOR_ACCENT_BLUE, fontSize: 16 } },
  { text: "• IoT Sensory Integration: ", options: { bold: true, color: 'FFFFFF', fontSize: 13 } },
  { text: "Deploy wireless temperature and humidity monitors for sensitive or cold items.\n\n", options: { color: 'E2E8F0', fontSize: 12 } },
  { text: "• Hardware Barcode Scanning: ", options: { bold: true, color: 'FFFFFF', fontSize: 13 } },
  { text: "Implement physical scanner and RFID integrations into a native mobile operations client.\n\n", options: { color: 'E2E8F0', fontSize: 12 } },
  { text: "• Supply Chain Integrations: ", options: { bold: true, color: 'FFFFFF', fontSize: 13 } },
  { text: "Add webhook triggers to forward restocking orders directly to vendors for fully automated reordering.", options: { color: 'E2E8F0', fontSize: 12 } }
];
slide10.addText(roadmapText, {
  x: 6.9,
  y: 2.2,
  w: 5.2,
  h: 4.5,
  valign: 'top',
  fontFace: FONT_FACE
});

// Save Presentation
const outputPath = path.resolve(__dirname, '../Smart_Warehouse_Management_Presentation.pptx');
pptx.writeFile({ fileName: outputPath })
  .then(fileName => {
    console.log(`Presentation generated successfully at: ${fileName}`);
  })
  .catch(err => {
    console.error('Failed to write presentation file:', err);
    process.exit(1);
  });
