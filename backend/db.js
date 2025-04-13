// backend/db.js
const sql = require("mssql");
require("dotenv").config();

/**
 * DATABASE 1: IOT_HUB
 * Tables: CODE_MACHINE_PRODUCTION, HISTORY_MACHINE_PRODUCTION,
 * MACHINE_STATUS_PRODUCTION, MachineData
 */
const configDB1 = {
  user: process.env.DB1_USER,
  password: process.env.DB1_PASSWORD,
  server: process.env.DB1_SERVER,
  database: process.env.DB1_DATABASE, // IOT_HUB
  port: parseInt(process.env.DB1_PORT) || 1433,
  options: {
    encrypt: process.env.DB1_ENCRYPT === "true",
    trustServerCertificate: process.env.DB1_TRUST_CERT === "true",
  },
};

/**
 * DATABASE 2: DEPT_MANUFACTURING
 * Tables: INVENTORY_PARTS, INVENTORY_SPAREPART, USER_JOBLIST,
 * USER_JOBLIST_HISTORY, USER_NAME
 */
const configDB2 = {
  user: process.env.DB2_USER,
  password: process.env.DB2_PASSWORD,
  server: process.env.DB2_SERVER,
  database: process.env.DB2_DATABASE, // DEPT_MANUFACTURING
  port: parseInt(process.env.DB2_PORT) || 1433,
  options: {
    encrypt: process.env.DB2_ENCRYPT === "true",
    trustServerCertificate: process.env.DB2_TRUST_CERT === "true",
  },
};

/**
 * DATABASE 3: MACHINE_LOG
 * No specific tables identified in the provided code
 */
const configDB3 = {
  user: process.env.DB3_USER,
  password: process.env.DB3_PASSWORD,
  server: process.env.DB3_SERVER,
  database: process.env.DB3_DATABASE, // MACHINE_LOG
  port: parseInt(process.env.DB3_PORT) || 1433,
  options: {
    encrypt: process.env.DB3_ENCRYPT === "true",
    trustServerCertificate: process.env.DB3_TRUST_CERT === "true",
  },
};

// Fungsi untuk menghubungkan ke semua database
const connectDatabases = async () => {
  try {
    // Koneksi ke Database 1 (IOT_HUB)
    const poolDB1 = await new sql.ConnectionPool(configDB1).connect();
    console.log(`Connected to ${process.env.DB1_DATABASE} Database (IOT_HUB)`);

    // Koneksi ke Database 2 (DEPT_MANUFACTURING)
    const poolDB2 = await new sql.ConnectionPool(configDB2).connect();
    console.log(
      `Connected to ${process.env.DB2_DATABASE} Database (DEPT_MANUFACTURING)`
    );

    // Koneksi ke Database 3 (MACHINE_LOG)
    const poolDB3 = await new sql.ConnectionPool(configDB3).connect();
    console.log(
      `Connected to ${process.env.DB3_DATABASE} Database (MACHINE_LOG)`
    );

    // Mengembalikan objek koneksi database
    return {
      iotHub: poolDB1, // DB1: IOT_HUB
      deptMfg: poolDB2, // DB2: DEPT_MANUFACTURING
      plcData: poolDB3, // DB3: MACHINE_LOG
    };
  } catch (error) {
    console.error("Error connecting to SQL Servers:", error.message);
    throw error;
  }
};

module.exports = {
  connectDatabases,
  configDB1,
  configDB2,
  configDB3,
};
