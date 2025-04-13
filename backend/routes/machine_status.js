// backend/routes/machine_status.js
const express = require("express");
const router = express.Router();
const sql = require("mssql");

// Helper function untuk membuat koneksi database
const getDatabase = (location) => {
  return location === "CKR" ? global.databases.iotHub : null;
};

// Get current status of all machines
router.get("/all/:location", async (req, res) => {
  try {
    const { location } = req.params;
    const database = getDatabase(location);

    if (!database) {
      return res.status(400).json({
        message: "Invalid location. Use 'CKR' or 'KRW'.",
      });
    }

    const query = `
      SELECT 
        [MACHINE_CODE] as NoMachine,
        [STATUS] as Status,
        [MACHINE_NAME] as MachineName
      FROM [dbo].[CODE_MACHINE_PRODUCTION]
      WHERE [LOCATION] = @location
    `;

    const request = database.request();
    request.input("location", sql.VarChar, location);

    const result = await request.query(query);
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error fetching all machine statuses:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.toString(),
    });
  }
});

// Get current status of a specific machine
router.get("/current/:location/:machineCode", async (req, res) => {
  try {
    const { location, machineCode } = req.params;
    const database = getDatabase(location);

    if (!database) {
      return res.status(400).json({
        message: "Invalid location. Use 'CKR' or 'KRW'.",
      });
    }

    const query = `
      SELECT TOP 1
        [MACHINE_CODE] as NoMachine,
        [MACHINE_NAME] as MachineName,
        [STATUS] as Status,
        [LINE_GROUP] as LineGroup,
        [FACTORY] as Factory,
        [IP_ADDRESS] as IpAddress,
        [CreatedAt] as CreatedAt,
        [UpdatedAt] as UpdatedAt
      FROM [dbo].[CODE_MACHINE_PRODUCTION]
      WHERE [LOCATION] = @location 
        AND [MACHINE_CODE] = @machineCode
    `;

    const request = database.request();
    request.input("location", sql.VarChar, location);
    request.input("machineCode", sql.VarChar, machineCode);

    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: "No status data found for this machine",
      });
    }

    res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error("Error fetching machine status:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.toString(),
    });
  }
});

// Performance route (placeholder)
router.get("/performance/:location/:machineCode", async (req, res) => {
  try {
    const { location, machineCode } = req.params;
    const database = getDatabase(location);

    if (!database) {
      return res.status(400).json({
        message: "Invalid location. Use 'CKR' or 'KRW'.",
      });
    }

    // Placeholder for performance metrics
    const query = `
      SELECT 
        [MACHINE_CODE] as NoMachine,
        [STATUS] as Status,
        [LINE_GROUP] as LineGroup
      FROM [dbo].[CODE_MACHINE_PRODUCTION]
      WHERE [LOCATION] = @location 
        AND [MACHINE_CODE] = @machineCode
    `;

    const request = database.request();
    request.input("location", sql.VarChar, location);
    request.input("machineCode", sql.VarChar, machineCode);

    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: "No performance data found for this machine",
      });
    }

    res.status(200).json({
      ...result.recordset[0],
      performance: "0%", // Placeholder
      actual: 0,
      plan: 100,
    });
  } catch (error) {
    console.error("Error fetching machine performance:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.toString(),
    });
  }
});

module.exports = router;