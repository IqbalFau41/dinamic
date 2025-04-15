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
    console.log(
      `Machine detail request received for machine code: ${machineCode}`
    );

    const { plcData } = global.databases;

    // Verify machineCode format and sanitize to prevent SQL injection
    if (!machineCode || !/^\d+$/.test(machineCode)) {
      console.error(`Invalid machine code format: ${machineCode}`);
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
      console.log("Executing column check query");
      // Try to get column info first
      const columnResult = await plcData.request().query(checkColumnsQuery);
      console.log("Column query executed successfully");

      if (columnResult.recordset.length === 0) {
        console.error(`No data found for machine ${machineCode}`);
        return res.status(404).json({
          message: `No data found for machine ${machineCode}`,
        });
      }

      // Get the actual column names from the result
      const columns = Object.keys(columnResult.recordset[0]);
      console.log("Available columns:", columns);

      // Now use the actual columns in our main query
      const columnsString = columns.map((col) => `[${col}]`).join(", ");

      const query = `
        SELECT TOP 100 ${columnsString}
        FROM [MACHINE_LOG].[dbo].[Machine_${machineCode}]
        ORDER BY [CreatedAt] DESC
      `;

      console.log("Executing main data query");
      const result = await plcData.request().query(query);
      console.log(`Retrieved ${result.recordset.length} records`);

      if (result.recordset.length === 0) {
        console.error(`No data found for machine ${machineCode}`);
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

      console.log("Executing machine info query");
      const machineInfoResult = await iotHub.request().query(machineInfoQuery);
      const machineInfo = machineInfoResult.recordset[0] || {};
      console.log("Machine info retrieved:", machineInfo);

      // Process the data
      const productionData = result.recordset;

      // Log a sample record to check the date format
      if (productionData.length > 0) {
        console.log("Sample record from database:");
        console.log(productionData[0]);
        console.log("CreatedAt type:", typeof productionData[0].CreatedAt);
        console.log("CreatedAt value:", productionData[0].CreatedAt);
      }

      const latestRecord = productionData[0];

      // Use utility functions to process data
      console.log("Processing shift data");
      const shifts = processShiftData(productionData);
      console.log("Preparing chart data");
      const chartData = prepareChartData(productionData);

      const response = {
        machineInfo,
        latestRecord,
        shifts,
        chartData,
      };

      console.log("Sending response");
      res.json(response);
    } catch (error) {
      console.error("Error in primary query approach:", error);
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

      console.log("Executing fallback query");
      const result = await plcData.request().query(fallbackQuery);

      if (result.recordset.length === 0) {
        console.error(
          `No data found for machine ${machineCode} in fallback query`
        );
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

      console.log("Executing machine info query (fallback path)");
      const machineInfoResult = await iotHub.request().query(machineInfoQuery);
      const machineInfo = machineInfoResult.recordset[0] || {};

      // Process the data
      const productionData = result.recordset;

      // Log a sample record from fallback query
      if (productionData.length > 0) {
        console.log("Sample record from fallback query:");
        console.log(productionData[0]);
      }

      const latestRecord = productionData[0];

      // Use utility functions to process data
      console.log("Processing shift data (fallback path)");
      const shifts = processShiftData(productionData);
      console.log("Preparing chart data (fallback path)");
      const chartData = prepareChartData(productionData);

      const response = {
        machineInfo,
        latestRecord,
        shifts,
        chartData,
      };

      console.log("Sending response (fallback path)");
      res.json(response);
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
