// backend/utils/machineDetailUtils.js

/**
 * Groups machine data by day for weekly and monthly chart views
 * @param {Array} data - Array of machine records
 * @returns {Object} Object containing weekly and monthly datasets
 */
const prepareChartData = (data) => {
  // Get date ranges
  const now = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(now.getDate() - 7);

  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(now.getMonth() - 1);

  // Initialize weekly data arrays
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyProduction = Array(7).fill(0);
  const weeklyTarget = Array(7).fill(2000); // Example target

  // Initialize monthly data arrays (for last 30 days)
  const monthlyLabels = [];
  const monthlyProduction = [];
  const monthlyTarget = [];

  // Create date labels for the past 30 days
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = `${date.getMonth() + 1}/${date.getDate()}`;
    monthlyLabels.push(dateString);
    monthlyProduction.push(0);
    monthlyTarget.push(2000); // Example target
  }

  // Process data to populate chart datasets
  data.forEach((record) => {
    const recordDate = new Date(record.CreatedAt);

    // If record is within the last week
    if (recordDate >= oneWeekAgo) {
      const dayOfWeek = recordDate.getDay(); // 0 = Sunday, 6 = Saturday
      weeklyProduction[dayOfWeek] += record.MACHINE_COUNTER || 0;
    }

    // If record is within the last month
    if (recordDate >= oneMonthAgo) {
      const dayOffset = Math.floor((now - recordDate) / (1000 * 60 * 60 * 24));
      if (dayOffset >= 0 && dayOffset < 31) {
        monthlyProduction[30 - dayOffset] += record.MACHINE_COUNTER || 0;
      }
    }
  });

  return {
    weekly: {
      labels: weekDays,
      datasets: [
        {
          label: "Production",
          data: weeklyProduction,
          borderColor: "rgba(32, 168, 216, 0.8)",
          backgroundColor: "rgba(32, 168, 216, 0.2)",
        },
        {
          label: "Target",
          data: weeklyTarget,
          borderColor: "rgba(77, 189, 116, 0.8)",
          backgroundColor: "transparent",
          borderDash: [5, 5],
        },
      ],
    },
    monthly: {
      labels: monthlyLabels,
      datasets: [
        {
          label: "Production",
          data: monthlyProduction,
          borderColor: "rgba(32, 168, 216, 0.8)",
          backgroundColor: "rgba(32, 168, 216, 0.2)",
        },
        {
          label: "Target",
          data: monthlyTarget,
          borderColor: "rgba(77, 189, 116, 0.8)",
          backgroundColor: "transparent",
          borderDash: [5, 5],
        },
      ],
    },
  };
};

/**
 * Processes machine data to generate shift information
 * @param {Array} data - Array of machine records
 * @returns {Array} Array of shift objects with processed data
 */
const processShiftData = (data) => {
  // Define shifts
  const shifts = [
    {
      name: "Shift 1 (07:00 - 15:00)",
      data: [],
      hours: [
        "07:00",
        "08:00",
        "09:00",
        "10:00",
        "11:00",
        "12:00",
        "13:00",
        "14:00",
        "15:00",
      ],
      productionValues: [0, 0, 0, 0, 0, 0, 0, 0, 0],
      goodParts: 0,
      defectiveParts: 0,
      downtime: 0,
    },
    {
      name: "Shift 2 (14:00 - 22:00)",
      data: [],
      hours: [
        "15:00",
        "16:00",
        "17:00",
        "18:00",
        "19:00",
        "20:00",
        "21:00",
        "22:00",
      ],
      productionValues: [0, 0, 0, 0, 0, 0, 0, 0, 0],
      goodParts: 0,
      defectiveParts: 0,
      downtime: 0,
    },
    {
      name: "Shift 3 (22:00 - 06:00)",
      data: [],
      hours: [
        "22:00",
        "23:00",
        "00:00",
        "01:00",
        "02:00",
        "03:00",
        "04:00",
        "05:00",
        "06:00",
      ],
      productionValues: [0, 0, 0, 0, 0, 0, 0, 0, 0],
      goodParts: 0,
      defectiveParts: 0,
      downtime: 0,
    },
  ];

  // Group data by shift and calculate totals
  data.forEach((record) => {
    const recordDate = new Date(record.CreatedAt);
    const hour = recordDate.getHours();

    // Determine which shift this record belongs to
    let shiftIndex;
    if (hour >= 6 && hour < 14) {
      shiftIndex = 0;
    } else if (hour >= 14 && hour < 22) {
      shiftIndex = 1;
    } else {
      shiftIndex = 2;
    }

    // Add record to appropriate shift
    shifts[shiftIndex].data.push(record);

    // Update production values for the specific hour
    const hourIndex = (hour - 6 + 24) % 24; // Adjust for 24-hour format
    const normalizedHourIndex = Math.floor(hourIndex / 8); // Normalize to 0-7 range within shift

    // Increment the production value for this hour
    shifts[shiftIndex].productionValues[normalizedHourIndex] +=
      record.MACHINE_COUNTER || 0;

    // Update status counters based on operation name
    if (record.OPERATION_NAME === "Normal Operation") {
      shifts[shiftIndex].goodParts += 25; // Percentage for progress bar
    } else if (record.OPERATION_NAME === "Warning") {
      shifts[shiftIndex].defectiveParts += 15; // Percentage for progress bar
    } else {
      shifts[shiftIndex].downtime += 10; // Percentage for progress bar
    }
  });

  // Cap percentages at 100%
  shifts.forEach((shift) => {
    const total = shift.goodParts + shift.defectiveParts + shift.downtime;
    if (total > 100) {
      const scaleFactor = 100 / total;
      shift.goodParts = Math.floor(shift.goodParts * scaleFactor);
      shift.defectiveParts = Math.floor(shift.defectiveParts * scaleFactor);
      shift.downtime = Math.floor(shift.downtime * scaleFactor);
    }
  });

  return shifts;
};

/**
 * Process machine data to generate response for frontend
 * @param {Object} machineInfo - Information about the machine
 * @param {Array} machineData - Array of machine records
 * @returns {Object} Processed data for frontend
 */
const processMachineData = (machineInfo, machineData) => {
  // Sort data by date
  const sortedData = [...machineData].sort(
    (a, b) => new Date(a.CreatedAt) - new Date(b.CreatedAt)
  );

  // Get latest record
  const latestRecord =
    sortedData.length > 0 ? sortedData[sortedData.length - 1] : null;

  // Process shift data
  const shifts = processShiftData(sortedData);

  // Prepare chart data
  const chartData = prepareChartData(sortedData);

  return {
    machineInfo,
    latestRecord,
    shifts,
    chartData,
  };
};

module.exports = {
  prepareChartData,
  processShiftData,
  processMachineData,
};
