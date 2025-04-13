// backend/controllers/machineDetailController.js

const db = require("../models");
const { processMachineData } = require("../utils/machineDetailUtils");

/**
 * Get machine details including production data and shift information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getMachineDetail = async (req, res) => {
  try {
    const { name } = req.params;

    // Fetch machine information
    const machineInfo = await db.Machine.findOne({
      where: { MACHINE_NAME: name },
    });

    if (!machineInfo) {
      return res.status(404).json({
        success: false,
        message: "Machine not found",
      });
    }

    // Fetch machine data for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const machineData = await db.MachineData.findAll({
      where: {
        MACHINE_ID: machineInfo.MACHINE_ID,
        CreatedAt: {
          [db.Sequelize.Op.gte]: thirtyDaysAgo,
        },
      },
      order: [["CreatedAt", "ASC"]],
    });

    // Process the data for frontend
    const processedData = processMachineData(machineInfo, machineData);

    res.status(200).json({
      success: true,
      ...processedData,
    });
  } catch (error) {
    console.error("Error fetching machine details:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching machine details",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Route setup
const express = require("express");
const router = express.Router();
const machineDetailController = require("../controllers/machineDetailController");

router.get("/machine-detail/:name", machineDetailController.getMachineDetail);

module.exports = router;
