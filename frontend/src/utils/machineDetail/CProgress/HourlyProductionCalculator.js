// HourlyProductionCalculator.js
// This file contains functions to calculate production metrics by hour

// Calculates the production per hour based on the machine counter
export const calculateProductionByHour = (data, shiftHours, currentTime) => {
  if (!data || data.length === 0) return Array(shiftHours.length).fill(0)

  // Filter data for only current/past events
  const filteredData = data.filter((item) => new Date(item.CreatedAt) <= currentTime)

  if (filteredData.length === 0) return Array(shiftHours.length).fill(0)

  // Sort data by time
  const sortedData = [...filteredData].sort(
    (a, b) => new Date(a.CreatedAt).getTime() - new Date(b.CreatedAt).getTime(),
  )

  // Initialize production array
  const hourlyProduction = Array(shiftHours.length).fill(0)

  // Parse hours from the shift hours array
  const hours = shiftHours.map((hour) => parseInt(hour.split(':')[0], 10))

  // Track the last counter value
  let lastCounter = sortedData[0].MACHINE_COUNTER || 0
  let lastTimeStamp = new Date(sortedData[0].CreatedAt)

  // Process each data point
  for (let i = 1; i < sortedData.length; i++) {
    const record = sortedData[i]
    if (!record.MACHINE_COUNTER) continue

    const recordTime = new Date(record.CreatedAt)
    const hourIndex = findHourIndex(recordTime, hours, shiftHours)

    if (hourIndex >= 0) {
      // Calculate production increment
      const increment = record.MACHINE_COUNTER - lastCounter
      if (increment > 0) {
        hourlyProduction[hourIndex] += increment
      }
    }

    lastCounter = record.MACHINE_COUNTER
    lastTimeStamp = recordTime
  }

  return hourlyProduction
}

// Finds which hour bucket a timestamp belongs to
export const findHourIndex = (timestamp, hours, shiftHours) => {
  const recordHour = timestamp.getHours()
  const recordMinute = timestamp.getMinutes()

  // Find the appropriate hour bucket
  for (let i = 0; i < hours.length - 1; i++) {
    const currentHour = hours[i]
    const nextHour = hours[i + 1]

    // Handle crossing midnight
    if (nextHour < currentHour) {
      if (recordHour >= currentHour || recordHour < nextHour) {
        return i
      }
    } else {
      if (recordHour >= currentHour && recordHour < nextHour) {
        return i
      }
    }
  }

  // Check if it's in the last hour range
  const lastHour = hours[hours.length - 1]
  const firstHour = hours[0]

  if (lastHour > firstHour) {
    if (recordHour >= lastHour && recordHour < 24) {
      return hours.length - 1
    }
  } else {
    if (recordHour >= lastHour || recordHour < firstHour) {
      return hours.length - 1
    }
  }

  return -1
}

// Calculate the total production for a shift
export const calculateTotalProduction = (data, currentTime) => {
  if (!data || data.length === 0) return 0

  const filteredData = data.filter((item) => new Date(item.CreatedAt) <= currentTime)

  if (filteredData.length === 0) return 0

  // Sort data by time
  const sortedData = [...filteredData].sort(
    (a, b) => new Date(a.CreatedAt).getTime() - new Date(b.CreatedAt).getTime(),
  )

  // Find the highest counter value
  let maxCounter = 0

  for (const record of sortedData) {
    if (record.MACHINE_COUNTER && record.MACHINE_COUNTER > maxCounter) {
      maxCounter = record.MACHINE_COUNTER
    }
  }

  return maxCounter
}
