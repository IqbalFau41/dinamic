// backend/routes/machine_history.js
const express = require("express");
const router = express.Router();
const sql = require("mssql");

// Get machine history
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

    // Use global.databases to access IOT_HUB database
    const iotHubDb = global.databases.iotHub;

    // Use the new table MACHINE_STATUS_PRODUCTION
    let query = `
      SELECT 
        msp.[ID],
        msp.[MachineCode],
        msp.[MachineName],
        msp.[OPERATION_NAME],
        msp.[MACHINE_COUNTER],
        msp.[SEND_PLC],
        msp.[CreatedAt],
        msp.[UpdatedAt]
      FROM [dbo].[MACHINE_STATUS_PRODUCTION] msp
      INNER JOIN [dbo].[CODE_MACHINE_PRODUCTION] cmp
        ON msp.[MachineCode] = cmp.[MACHINE_CODE]
      WHERE cmp.[LOCATION] = @location
    `;

    const request = iotHubDb.request();
    request.input("location", sql.VarChar, location.toUpperCase());

    // Add optional LineGroup filter
    if (lineGroup) {
      query += ` AND cmp.[LINE_GROUP] = @lineGroup`;
      request.input("lineGroup", sql.VarChar, lineGroup);
    }

    query += ` ORDER BY msp.[CreatedAt] DESC`;

    const result = await request.query(query);
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error fetching machine history:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.toString(),
    });
  }
});

module.exports = router;