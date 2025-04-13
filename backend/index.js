require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { connectDatabases } = require("./db");
const setupWebSocketServer = require("./websockets");

const app = express();

// Extract environment variables
const PORT = process.env.BACKEND_PORT;
const HOST = process.env.BACKEND_HOST;
const API_PREFIX = process.env.API_PREFIX;
const CORS_ORIGIN = process.env.CORS_ORIGIN;
const CORS_METHODS = process.env.CORS_METHODS;
const CORS_HEADERS = process.env.CORS_HEADERS;

// Middleware
app.use(express.json());

// Dynamic CORS configuration from environment variables
app.use(
  cors({
    origin: CORS_ORIGIN,
    methods: CORS_METHODS.split(","),
    allowedHeaders: CORS_HEADERS.split(","),
    credentials: true,
  })
);

// Fungsi async untuk inisialisasi server
const startServer = async () => {
  try {
    // Sambungkan ke semua database
    const databases = await connectDatabases();

    // Tambahkan database ke global untuk diakses di seluruh aplikasi
    global.databases = databases;

    // Routes using DEPT_MANUFACTURING (DB2)
    const inventoryRouter = require("./routes/inventory");
    const authRouter = require("./routes/auth");
    const jobListRouter = require("./routes/joblist");
    const historyJobListRouter = require("./routes/history_joblist");
    const machineDetailRouter = require("./routes/machine_detail");

    // Routes using IOT_HUB (DB1)
    const machineNameRouter = require("./routes/machine_name");
    const machineStatusRouter = require("./routes/machine_status");
    const machineHistoryRouter = require("./routes/machine_history");

    // Register routes for DEPT_MANUFACTURING (DB2)
    app.use(`${API_PREFIX}/inventory`, inventoryRouter);
    app.use(`${API_PREFIX}/auth`, authRouter);
    app.use(`${API_PREFIX}/job-list`, jobListRouter);
    app.use(`${API_PREFIX}/job-history`, historyJobListRouter);

    // Register routes for IOT_HUB (DB1)
    app.use(`${API_PREFIX}/machine-names`, machineNameRouter);
    app.use(`${API_PREFIX}/machine-status`, machineStatusRouter);
    app.use(`${API_PREFIX}/machine-history`, machineHistoryRouter);
    app.use(`${API_PREFIX}/machine-detail`, machineDetailRouter);

    // Health check endpoint
    app.get(`${API_PREFIX}/health`, (req, res) => {
      res.status(200).json({
        status: "ok",
        message: "Server is running",
        databases: {
          db1: process.env.DB1_DATABASE, // IOT_HUB
          db2: process.env.DB2_DATABASE, // DEPT_MANUFACTURING
          db3: process.env.DB3_DATABASE, // MACHINE_LOG
        },
      });
    });

    // Create HTTP server
    const server = http.createServer(app);

    // Setup WebSocket server
    const wsServer = setupWebSocketServer(server);

    // Start HTTP server (which also handles WebSockets)
    server.listen(PORT, HOST, () =>
      console.log(
        `Server running on http://${HOST}:${PORT} with WebSocket support`
      )
    );

    // Handle graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM signal received: closing HTTP server");
      wsServer.close();
      server.close(() => {
        console.log("HTTP server closed");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Jalankan server
startServer();
