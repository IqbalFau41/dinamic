// routes/inventory.js
const express = require("express");
const router = express.Router();

// Middleware for validating body
const validateBody = (req, res, next) => {
  const { name_part, qty_part } = req.body;

  if (!name_part || qty_part === undefined) {
    return res.status(400).json({
      error: "Name and Quantity are required",
    });
  }
  next();
};

// GET all inventory items
router.get("/", async (req, res) => {
  try {
    // Get database connection from global
    const { deptMfg } = global.databases;

    if (!deptMfg) {
      console.error("Database connection not available for DEPT_MANUFACTURING");
      return res.status(500).json({ message: "Database connection error" });
    }

    const request = deptMfg.request();
    const result = await request.query(`
      SELECT 
        no_part, 
        name_part, 
        type_part, 
        maker_part, 
        qty_part,
        location_part, 
        factory_part,
        information_part 
      FROM INVENTORY_PARTS
      ORDER BY no_part DESC
    `);

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error fetching inventory items:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// GET single inventory item by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  // Validate ID
  if (!id) {
    return res.status(400).json({ error: "Valid ID is required" });
  }

  try {
    const { deptMfg } = global.databases;

    if (!deptMfg) {
      return res.status(500).json({ message: "Database connection error" });
    }

    const request = deptMfg.request();
    request.input("id", id);

    const result = await request.query(`
      SELECT 
        no_part, 
        name_part, 
        type_part, 
        maker_part, 
        qty_part,
        location_part, 
        factory_part,
        information_part 
      FROM INVENTORY_PARTS 
      WHERE no_part = @id
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Inventory item not found" });
    }

    res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error("Error fetching inventory item:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// Create new inventory item
router.post("/", validateBody, async (req, res) => {
  try {
    const { deptMfg } = global.databases;

    if (!deptMfg) {
      return res.status(500).json({ message: "Database connection error" });
    }

    const request = deptMfg.request();

    // Fields matching frontend - REMOVE no_part
    request.input("name_part", req.body.name_part);
    request.input("type_part", req.body.type_part || null);
    request.input("maker_part", req.body.maker_part || null);
    request.input("qty_part", req.body.qty_part);
    request.input("location_part", req.body.location_part || null);
    request.input("factory_part", req.body.factory_part || null);
    request.input("information_part", req.body.information_part || null);

    await request.query(`
      INSERT INTO INVENTORY_PARTS (
        name_part, 
        type_part, 
        maker_part, 
        qty_part,
        location_part, 
        factory_part, 
        information_part
      ) VALUES (
        @name_part, 
        @type_part, 
        @maker_part, 
        @qty_part,
        @location_part, 
        @factory_part, 
        @information_part
      )
    `);
    res.status(201).json({ message: "Item created successfully" });
  } catch (error) {
    console.error("Error creating inventory item:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// Update inventory item
router.put("/:id", validateBody, async (req, res) => {
  const { id } = req.params;

  // Validate ID
  if (!id) {
    return res.status(400).json({ error: "Valid ID is required" });
  }

  try {
    const { deptMfg } = global.databases;

    if (!deptMfg) {
      return res.status(500).json({ message: "Database connection error" });
    }

    // Check if item exists
    const checkRequest = deptMfg.request();
    checkRequest.input("id", id);

    const checkItem = await checkRequest.query(`
      SELECT no_part FROM INVENTORY_PARTS WHERE no_part = @id
    `);

    if (checkItem.recordset.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Update item
    const updateRequest = deptMfg.request();
    updateRequest.input("id", id);

    // Only the fields we need
    updateRequest.input("name_part", req.body.name_part);
    updateRequest.input("type_part", req.body.type_part || null);
    updateRequest.input("maker_part", req.body.maker_part || null);
    updateRequest.input("qty_part", req.body.qty_part);
    updateRequest.input("location_part", req.body.location_part || null);
    updateRequest.input("factory_part", req.body.factory_part || null);
    updateRequest.input("information_part", req.body.information_part || null);

    await updateRequest.query(`
      UPDATE INVENTORY_PARTS 
      SET 
        name_part = @name_part, 
        type_part = @type_part, 
        maker_part = @maker_part, 
        qty_part = @qty_part,
        location_part = @location_part, 
        factory_part = @factory_part, 
        information_part = @information_part
      WHERE no_part = @id
    `);
    res.status(200).json({ message: "Item updated successfully" });
  } catch (error) {
    console.error("Error updating inventory:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// Delete inventory item
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  // Validate ID
  if (!id) {
    return res.status(400).json({ error: "Valid ID is required" });
  }

  try {
    const { deptMfg } = global.databases;

    if (!deptMfg) {
      return res.status(500).json({ message: "Database connection error" });
    }

    // Check if item exists
    const checkRequest = deptMfg.request();
    checkRequest.input("id", id);

    const checkItem = await checkRequest.query(`
      SELECT no_part FROM INVENTORY_PARTS WHERE no_part = @id
    `);

    if (checkItem.recordset.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Delete item
    const deleteRequest = deptMfg.request();
    deleteRequest.input("id", id);

    await deleteRequest.query(`
      DELETE FROM INVENTORY_PARTS WHERE no_part = @id
    `);
    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

module.exports = router;
