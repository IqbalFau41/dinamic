// backend/websockets/index.js
const WebSocket = require("ws");
const http = require("http");
const url = require("url");

// Initialize WebSocket server
function setupWebSocketServer(server) {
  const connectionCheckInterval = setInterval(() => {
    for (const [ws, clientInfo] of clients.entries()) {
      // Check if connection is still alive
      if (ws.readyState !== WebSocket.OPEN) {
        console.log(
          `Client ${clientInfo.id} connection is no longer open, removing.`
        );
        clients.delete(ws);
      }
    }
  }, 30000); // Check every 30 seconds
  const wss = new WebSocket.Server({ noServer: true });

  // Store connected clients with their filters
  const clients = new Map();

  // Global cache yang bertahan antara koneksi
  const globalMachineDataCache = {};

  // Handle new connections
  wss.on("connection", (ws, request, locationParam, lineGroupParam) => {
    const clientId = Date.now();

    // Store client with their filter preferences
    clients.set(ws, {
      id: clientId,
      location: locationParam || null,
      lineGroup: lineGroupParam || null,
    });

    console.log(
      `Client connected: ${clientId}, Location: ${locationParam}, LineGroup: ${lineGroupParam}`
    );
    if (locationParam && globalMachineDataCache[locationParam]) {
      let data = globalMachineDataCache[locationParam];
      if (lineGroupParam) {
        data = data.filter((machine) => machine.lineGroup === lineGroupParam);
      }

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "machineData",
            data: data,
            timestamp: new Date().toISOString(),
          })
        );
      }
    }

    // Send initial data immediately upon connection
    sendMachineData(ws);

    // Handle client messages (for changing filters)
    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message);

        // Update client filters
        if (data.type === "setFilters") {
          const clientInfo = clients.get(ws);
          clients.set(ws, {
            ...clientInfo,
            location: data.location || clientInfo.location,
            lineGroup: data.lineGroup || clientInfo.lineGroup,
          });

          // Send updated data with new filters
          sendMachineData(ws);
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    });

    // Handle client disconnection
    ws.on("close", () => {
      console.log(`Client disconnected: ${clientId}`);
      clients.delete(ws);
    });
  });

  // Handle HTTP upgrade request (for WebSocket connections)
  server.on("upgrade", (request, socket, head) => {
    const pathname = url.parse(request.url).pathname;

    // Only handle WebSocket connections to /ws/machines
    if (pathname === "/ws/machines") {
      // Parse query parameters
      const queryParams = url.parse(request.url, true).query;
      const location = queryParams.location;
      const lineGroup = queryParams.lineGroup;

      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request, location, lineGroup);
      });
    } else {
      socket.destroy();
    }
  });

  // Set up periodic data broadcast
  const machineDataCache = {};
  let isFetchingData = false;

  // Function to fetch data from database
  async function fetchMachineData() {
    if (isFetchingData) return;

    try {
      isFetchingData = true;

      const { iotHub } = global.databases;

      // Get all distinct locations we need to query
      const locations = new Set();
      for (const [, clientInfo] of clients.entries()) {
        if (clientInfo.location) {
          locations.add(clientInfo.location);
        }
      }

      // If no clients or no locations, skip fetching
      if (clients.size === 0 || locations.size === 0) {
        return;
      }

      // For each location, fetch machine data
      for (const location of locations) {
        // Query machine names
        const machineNamesResult = await iotHub.request().query(`
          SELECT MACHINE_CODE, MACHINE_NAME, LINE_GROUP
          FROM CODE_MACHINE_PRODUCTION
          WHERE LOCATION = '${location}'
        `);

        // Query latest machine history
        const historyResult = await iotHub.request().query(`
          SELECT h.MachineCode, h.OPERATION_NAME, h.MACHINE_COUNTER, h.CreatedAt
          FROM MACHINE_STATUS_PRODUCTION h
          INNER JOIN (
            SELECT MachineCode, MAX(CreatedAt) as MaxDate
            FROM MACHINE_STATUS_PRODUCTION
            GROUP BY MachineCode
          ) m ON h.MachineCode = m.MachineCode AND h.CreatedAt = m.MaxDate
        `);

        // Process and combine the data
        const machineNames = machineNamesResult.recordset || [];
        const machineHistory = historyResult.recordset || [];

        // Transform to the expected format
        const transformedData = machineNames.map((machine) => {
          // Find the most recent history record for this machine
          const history =
            machineHistory.find(
              (h) => h.MachineCode === machine.MACHINE_CODE
            ) || {};

          // Simplified status config (should match your front-end logic)
          const statusName = history.OPERATION_NAME || "Shutdown";
          let statusConfig = {
            displayName: statusName,
            borderColor: "#ccc",
            headerColor: "#666",
          };

          if (statusName === "Normal Operation") {
            statusConfig = {
              displayName: "Normal Operation",
              borderColor: "#28a745",
              headerColor: "#28a745",
            };
          } else if (statusName === "Error" || statusName === "Alarm") {
            statusConfig = {
              displayName: statusName,
              borderColor: "#dc3545",
              headerColor: "#dc3545",
            };
          }

          // Calculate performance metrics
          const actual = history.MACHINE_COUNTER || 0;
          const plan = 100; // Fixed planned value
          const performance = plan > 0 ? Math.round((actual / plan) * 100) : 0;

          return {
            no_mesin: machine.MACHINE_CODE,
            mesin: machine.MACHINE_NAME,
            lineGroup: machine.LINE_GROUP,
            status: history.OPERATION_NAME || "Shutdown",
            message: statusConfig.displayName,
            Plan: plan,
            actual: actual,
            performance: `${performance}%`,
            startTime: history.CreatedAt,
            statusConfig: statusConfig,
          };
        });

        // Store in cache
        machineDataCache[location] = transformedData;
        globalMachineDataCache[location] = transformedData;
      }
    } catch (error) {
      console.error("Error fetching machine data:", error);
    } finally {
      isFetchingData = false;
    }
  }

  // Function to send machine data to a specific client
  async function sendMachineData(ws) {
    const clientInfo = clients.get(ws);
    if (!clientInfo || !clientInfo.location) return;

    const location = clientInfo.location;
    const lineGroup = clientInfo.lineGroup;

    // Fetch data if not in cache
    if (!machineDataCache[location]) {
      await fetchMachineData();
    }

    // Get data from cache
    let data = machineDataCache[location] || [];

    // Apply line group filter if needed
    if (lineGroup) {
      data = data.filter((machine) => machine.lineGroup === lineGroup);
    }

    // Send data to client
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "machineData",
          data: data,
          timestamp: new Date().toISOString(),
        })
      );
    }
  }

  // Broadcast data to all clients periodically
  // Perbaiki fungsi broadcastMachineData()
  async function broadcastMachineData() {
    try {
      // Fetch fresh data first
      await fetchMachineData();

      // Send to each client based on their filters
      for (const [ws, clientInfo] of clients.entries()) {
        try {
          if (ws.readyState !== WebSocket.OPEN) continue;

          const location = clientInfo.location;
          const lineGroup = clientInfo.lineGroup;

          if (!location || !machineDataCache[location]) continue;

          // Get data and apply filter
          let data = machineDataCache[location] || [];
          if (lineGroup) {
            data = data.filter((machine) => machine.lineGroup === lineGroup);
          }

          // Send data to client
          ws.send(
            JSON.stringify({
              type: "machineData",
              data: data,
              timestamp: new Date().toISOString(),
            })
          );
        } catch (clientError) {
          console.error(
            `Error broadcasting to client ${clientInfo.id}:`,
            clientError
          );
          // Continue with other clients
        }
      }
    } catch (error) {
      console.error("Error in broadcastMachineData:", error);
    }
  }

  // Fetch and broadcast data every second
  const broadcastInterval = setInterval(broadcastMachineData, 300);
  // Clean up on server close
  return {
    close: () => {
      clearInterval(broadcastInterval);
      clearInterval(connectionCheckInterval);
      wss.close();
    },
  };
}

module.exports = setupWebSocketServer;
