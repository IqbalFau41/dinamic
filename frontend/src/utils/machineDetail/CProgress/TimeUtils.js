// TimeUtils.js - Contains time-related utility functions

// Check if shift has started based on current time
export const hasShiftStarted = (shiftStartHour, currentHour, currentMinute) => {
  const startHour = parseInt(shiftStartHour.split(':')[0], 10)
  return currentHour > startHour || (currentHour === startHour && currentMinute >= 0)
}

// Determine if current time is within production hours (starting at standardStartTime)
export const isWithinProductionHours = (currentHour, standardStartTime) => {
  return currentHour >= standardStartTime
}

// Function to determine if a time is within a shift's range
export const isTimeInShift = (hour, minutes, shiftStart, shiftEnd) => {
  const timeDecimal = hour + minutes / 60
  const startHour = parseInt(shiftStart.split(':')[0], 10)
  const endHour = parseInt(shiftEnd.split(':')[0], 10)

  // Handle shifts that cross midnight
  if (endHour < startHour) {
    return timeDecimal >= startHour || timeDecimal < endHour
  } else {
    return timeDecimal >= startHour && timeDecimal < endHour
  }
}

// Helper function to calculate position on timeline for a given time
export const calculateTimePosition = (hour, minute, shiftStartHour, shiftEndHour, totalHours) => {
  // Convert hour and minute to decimal hours
  const timeDecimal = hour + minute / 60

  // Handle shifts that cross midnight
  let hoursPassed
  if (shiftEndHour < shiftStartHour) {
    // Shift crosses midnight
    if (timeDecimal >= shiftStartHour) {
      // Time is after shift start but before midnight
      hoursPassed = timeDecimal - shiftStartHour
    } else {
      // Time is after midnight but before shift end
      hoursPassed = 24 - shiftStartHour + timeDecimal
    }
  } else {
    // Regular shift within same day
    hoursPassed = timeDecimal - shiftStartHour
  }

  // Calculate shift length in hours
  const shiftLength =
    shiftEndHour < shiftStartHour
      ? 24 - shiftStartHour + shiftEndHour
      : shiftEndHour - shiftStartHour

  // Calculate position as percentage of shift length
  return Math.min(100, Math.max(0, (hoursPassed / shiftLength) * 100))
}

// Helper function to calculate current time position for the active shift
export const calculateCurrentTimePosition = (
  hour,
  minute,
  shiftStartHour,
  shiftEndHour,
  totalHours,
) => {
  return calculateTimePosition(hour, minute, shiftStartHour, shiftEndHour, totalHours)
}
