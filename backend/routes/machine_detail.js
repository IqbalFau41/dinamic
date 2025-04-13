// backend/routes/machine_detail.js
const express = require("express");
const router = express.Router();
const {
  prepareChartData,
  processShiftData,
} = require("../utils/machineDetailUtils");

// Get machine detail based on machine code
router.get("/:machineCode", async (req, res) => {
  try {
    const { machineCode } = req.params;
    const { plcData } = global.databases;

    // Verify machineCode format and sanitize to prevent SQL injection
    if (!machineCode || !/^\d+$/.test(machineCode)) {
      return res.status(400).json({
        message: "Invalid machine code format",
      });
    }

    // First, let's check the column names available in the table
    const checkColumnsQuery = `
      SELECT TOP 1 * 
      FROM [MACHINE_LOG].[dbo].[Machine_${machineCode}]
    `;

    try {
      // Try to get column info first
      const columnResult = await plcData.request().query(checkColumnsQuery);

      if (columnResult.recordset.length === 0) {
        return res.status(404).json({
          message: `No data found for machine ${machineCode}`,
        });
      }

      // Get the actual column names from the result
      const columns = Object.keys(columnResult.recordset[0]);

      // Now use the actual columns in our main query
      const columnsString = columns.map((col) => `[${col}]`).join(", ");

      const query = `
        SELECT TOP 100 ${columnsString}
        FROM [MACHINE_LOG].[dbo].[Machine_${machineCode}]
        ORDER BY [CreatedAt] DESC
      `;

      const result = await plcData.request().query(query);

      if (result.recordset.length === 0) {
        return res.status(404).json({
          message: `No data found for machine ${machineCode}`,
        });
      }

      // Get additional machine info from IOT_HUB database
      const { iotHub } = global.databases;
      const machineInfoQuery = `
        SELECT 
          [MACHINE_CODE],
          [MACHINE_NAME],
          [LINE_GROUP],
          [LOCATION]
        FROM [IOT_HUB].[dbo].[CODE_MACHINE_PRODUCTION]
        WHERE [MACHINE_CODE] = '${machineCode}'
      `;

      const machineInfoResult = await iotHub.request().query(machineInfoQuery);
      const machineInfo = machineInfoResult.recordset[0] || {};

      // Process the data
      const productionData = result.recordset;
      const latestRecord = productionData[0];

      // Use utility functions to process data
      const shifts = processShiftData(productionData);
      const chartData = prepareChartData(productionData);

      res.json({
        machineInfo,
        latestRecord,
        shifts,
        chartData,
      });
    } catch (error) {
      // If the first approach fails, try with a modified query without the ID column
      const fallbackQuery = `
        SELECT TOP 100
          [MachineCode],
          [MachineName],
          [OPERATION_NAME],
          [MACHINE_COUNTER],
          [SEND_PLC],
          [CreatedAt]
        FROM [MACHINE_LOG].[dbo].[Machine_${machineCode}]
        ORDER BY [CreatedAt] DESC
      `;

      const result = await plcData.request().query(fallbackQuery);

      if (result.recordset.length === 0) {
        return res.status(404).json({
          message: `No data found for machine ${machineCode}`,
        });
      }

      // Continue with processing as before
      const { iotHub } = global.databases;
      const machineInfoQuery = `
        SELECT 
          [MACHINE_CODE],
          [MACHINE_NAME],
          [LINE_GROUP],
          [LOCATION]
        FROM [IOT_HUB].[dbo].[CODE_MACHINE_PRODUCTION]
        WHERE [MACHINE_CODE] = '${machineCode}'
      `;

      const machineInfoResult = await iotHub.request().query(machineInfoQuery);
      const machineInfo = machineInfoResult.recordset[0] || {};

      // Process the data
      const productionData = result.recordset;
      const latestRecord = productionData[0];

      // Use utility functions to process data
      const shifts = processShiftData(productionData);
      const chartData = prepareChartData(productionData);

      res.json({
        machineInfo,
        latestRecord,
        shifts,
        chartData,
      });
    }
  } catch (error) {
    console.error("Error fetching machine detail:", error);
    res.status(500).json({
      message: "Server error while fetching machine detail",
      error: error.message,
    });
  }
});

module.exports = router;
