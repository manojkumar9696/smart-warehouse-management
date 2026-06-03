const express = require("express");
const cors = require("cors");
const db = require("./config/db");
require("dotenv").config();

// Route Imports
const authRoutes = require("./routes/authRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Test DB Connection
db.query("SELECT 1")
  .then(() => {
    console.log("MySQL Database connected successfully");
  })
  .catch((err) => {
    console.error("MySQL Database connection failed:", err);
  });

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api", inventoryRoutes);

app.get("/", (req, res) => {
  res.send("Warehouse Management API Running");
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  
  // Clean handle for duplicate entry database constraint
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      success: false,
      message: 'Database conflict error: Record with this identifier already exists.'
    });
  }

  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "An unexpected internal server error occurred."
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
