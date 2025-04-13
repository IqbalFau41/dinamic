// ShiftCalculations.js - Contains shift-related calculation functions

// Function to find the latest data point before the shift starts
export const findLatestDataBeforeShift = (allData, shiftStartHour, currentTime) => {
  if (!allData || allData.length === 0) return null

  // Convert shift start to decimal hours
  const shiftStart = parseInt(shiftStartHour.split(':')[0], 10)

  // Sort all data by timestamp (ascending)
  const sortedData = [...allData].sort(
    (a, b) => new Date(a.CreatedAt).getTime() - new Date(b.CreatedAt).getTime(),
  )

  // Find the latest record before shift start
  let latestBeforeShift = null

  for (const record of sortedData) {
    const recordTime = new Date(record.CreatedAt)

    // Skip records with timestamps in the future
    if (recordTime > currentTime) continue

    const recordHour = recordTime.getHours()
    const recordMinute = recordTime.getMinutes()
    const recordDecimalTime = recordHour + recordMinute / 60

    // If this record is after shift start, stop looking
    if (recordHour >= shiftStart && recordHour < (shiftStart === 23 ? 0 : shiftStart + 1)) {
      break
    }

    latestBeforeShift = record
  }

  return latestBeforeShift
}

// Function to calculate hourly production values
export const calculateHourlyProduction = (data, shiftHours, currentTime) => {
  if (!data || data.length === 0) return Array(shiftHours.length).fill(0)

  // Sort data by timestamp and filter out future data
  const sortedData = [...data]
    .filter((record) => new Date(record.CreatedAt) <= currentTime)
    .sort((a, b) => new Date(a.CreatedAt).getTime() - new Date(b.CreatedAt).getTime())

  // Initialize hourly counters
  const hourlyProduction = Array(shiftHours.length).fill(0)

  // Extract hour values from shift hours
  const hours = shiftHours.map((timeStr) => parseInt(timeStr.split(':')[0], 10))

  // Track last hour's counter value to calculate increments
  let lastCounter = 0
  let lastHourIndex = -1

  sortedData.forEach((record) => {
    if (!record.CreatedAt || record.MACHINE_COUNTER === undefined) return

    const recordTime = new Date(record.CreatedAt)
    const recordHour = recordTime.getHours()

    // Find which hour bucket this record belongs to
    // A record at 7:30 contributes to the 8:00 counter (next hour)
    let hourIndex = -1
    for (let i = 0; i < hours.length; i++) {
      // For the last hour in the array, we include all records up to that hour
      if (i === hours.length - 1) {
        if (recordHour < hours[0] && recordHour >= hours[i]) {
          hourIndex = i
          break
        }
      }
      // For other hours, we check if the record falls between this hour and the next
      else if (i < hours.length - 1) {
        const nextHour = hours[i + 1]
        if (
          (recordHour >= hours[i] && recordHour < nextHour) ||
          (nextHour < hours[i] && (recordHour >= hours[i] || recordHour < nextHour))
        ) {
          hourIndex = i + 1 // Contributes to the next hour's counter
          break
        }
      }
    }

    if (hourIndex === -1) return // Record doesn't fall within shift hours

    // If this is the first record or a record from a new hour
    if (lastHourIndex === -1) {
      lastCounter = record.MACHINE_COUNTER
      lastHourIndex = hourIndex
    }
    // If this record belongs to the same hour bucket as the last one, update the counter
    else if (hourIndex === lastHourIndex) {
      // Update to the highest counter value in this hour
      lastCounter = Math.max(lastCounter, record.MACHINE_COUNTER)
    }
    // If this record belongs to a new hour bucket
    else {
      // Calculate increment for the previous hour
      hourlyProduction[lastHourIndex] = lastCounter

      // If there's a gap between the hour buckets, distribute zero values
      for (let i = lastHourIndex + 1; i < hourIndex; i++) {
        hourlyProduction[i] = 0
      }

      // For the current hour, start with the difference from the last hour
      lastCounter = record.MACHINE_COUNTER - lastCounter
      lastHourIndex = hourIndex
    }

    // Always update the current hour's production with at least the current increment
    hourlyProduction[hourIndex] = Math.max(hourlyProduction[hourIndex], lastCounter)
  })

  return hourlyProduction
}

// Function to get all data points across all shifts
export const getAllData = (shifts) => {
  let allData = []
  shifts.forEach((shift) => {
    if (shift.data && shift.data.length > 0) {
      allData = [...allData, ...shift.data]
    }
  })
  return allData
}

// Get color based on operation type
export const getOperationColor = (operationType) => {
  if (!operationType) return 'secondary'

  const operationUpper = operationType.toUpperCase()

  // Normal operations - green
  if (['NORMAL OPERATION', 'PEMANASAN', 'TENKEN'].includes(operationUpper)) {
    return 'success'
  }

  // Warning/problem states - red
  else if (['TROUBLE MACHINE', 'MACHINE OFF', 'REPAIR', 'NOT CONNECTED'].includes(operationUpper)) {
    return 'danger'
  }

  // Scheduled delays - yellow
  else if (
    [
      'CHOKOTEI',
      'DANDORI',
      'TOOL CHANGES',
      'GANTI TOISHI',
      'GANTI DRESSER',
      'DRESSING PROFILE',
      'DRESS-2',
    ].includes(operationUpper)
  ) {
    return 'warning'
  }

  // Planned stops - orange
  else if (
    [
      'STOP PLANNING',
      'JAM ISTIRAHAT',
      'RENCANA PERBAIKAN',
      'PLAN PROSES SELESAI',
      'MEETING PAGI/SORE',
    ].includes(operationUpper)
  ) {
    return 'warning-orange'
  }

  // Waiting states - blue
  else if (['WAITING MATERIAL', 'ANTRI JOB', 'MENUNGGU INTRUKSI ATASAN'].includes(operationUpper)) {
    return 'info'
  }

  // Quality check states - purple
  else if (['CEK QC', 'CHECK HAGATA', '1 TOOTH'].includes(operationUpper)) {
    return 'purple'
  }

  // Improvement activities - teal
  else if (['5S', 'KAIZEN', 'TRIAL'].includes(operationUpper)) {
    return 'teal'
  }

  // Administrative - light gray
  else if (['INPUT DATA', 'BUANG KIRIKO', 'CONTROL LOSS TIME'].includes(operationUpper)) {
    return 'light'
  }

  // Unknown/other - dark gray
  else if (['UNKNOWN LOSS TIME'].includes(operationUpper)) {
    return 'dark'
  }

  // Default for any unmatched operation
  else {
    return 'secondary'
  }
}
