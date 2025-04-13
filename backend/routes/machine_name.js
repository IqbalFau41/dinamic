// backend/routes/machine_name.js
const express = require("express");
const router = express.Router();
const sql = require("mssql");

// Get machines for CKR or KRW
router.get("/:location", async (req, res) => {
  try {
    const { location } = req.params;
    const { lineGroup } = req.query;

    // Validate location parameter
    if (!["CKR", "KRW"].includes(location.toUpperCase())) {
      return res.status(400).json({
        message: "Invalid location. Use 'CKR' or 'KRW'.",
      });
    }

    const iotHubDb = global.databases.iotHub;

    let query = `
      SELECT 
        [MACHINE_CODE],
        [MACHINE_NAME],
        [LINE_GROUP],
        [FACTORY],
        [LOCATION],
        [STATUS],
        [IP_ADDRESS]
      FROM [dbo].[CODE_MACHINE_PRODUCTION]
      WHERE [LOCATION] = @location
    `;

    const request = iotHubDb.request();
    request.input("location", sql.VarChar, location.toUpperCase());

    if (lineGroup) {
      query += ` AND [LINE_GROUP] = @lineGroup`;
      request.input("lineGroup", sql.VarChar, lineGroup);
    }

    query += ` ORDER BY [MACHINE_NAME]`;

    const result = await request.query(query);
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error(`Detailed Error for ${req.params.location} Machines:`, error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.toString(),
    });
  }
});

// Get line groups for CKR or KRW
// Get line groups for CKR or KRW
router.get("/:location/line-groups", async (req, res) => {
  try {
    const { location } = req.params;

    // Validate location parameter
    if (!["CKR", "KRW"].includes(location.toUpperCase())) {
      return res.status(400).json({
        message: "Invalid location. Use 'CKR' or 'KRW'.",
      });
    }

    const iotHubDb = global.databases.iotHub;

    const query = `
      SELECT DISTINCT 
        [LINE_GROUP]
      FROM [dbo].[CODE_MACHINE_PRODUCTION]
      WHERE [LOCATION] = @location
      ORDER BY [LINE_GROUP]
    `;

    const request = iotHubDb.request();
    request.input("location", sql.VarChar, location.toUpperCase());

    const result = await request.query(query);
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error(
      `Detailed Error fetching ${req.params.location} Line Groups:`,
      error
    );
    res.status(500).json({
      message: "Internal Server Error",
      error: error.toString(),
    });
  }
});

// Get machine list with flexible filtering
router.get("/machine-list", async (req, res) => {
  try {
    const { lineGroup, factory, location } = req.query;

    const iotHubDb = global.databases.iotHub;

    let query = `
      SELECT 
        [ID],
        [MACHINE_CODE],
        [IP_ADDRESS],
        [MACHINE_NAME],
        [LINE_GROUP],
        [FACTORY],
        [LOCATION],
        [IS_SHOW],
        [STATUS],
        [CreatedAt],
        [UpdatedAt]
      FROM [dbo].[CODE_MACHINE_PRODUCTION]
      WHERE 1=1
    `;

    const request = iotHubDb.request();

    if (lineGroup) {
      query += ` AND [LINE_GROUP] = @lineGroup`;
      request.input("lineGroup", sql.VarChar, lineGroup);
    }
    if (factory) {
      query += ` AND [FACTORY] = @factory`;
      request.input("factory", sql.VarChar, factory);
    }
    if (location) {
      query += ` AND [LOCATION] = @location`;
      request.input("location", sql.VarChar, location.toUpperCase());
    }

    query += ` ORDER BY [MACHINE_CODE]`;

    const result = await request.query(query);
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error fetching machine list:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.toString(),
    });
  }
});

module.exports = router;
