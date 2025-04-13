import React, { useState, useEffect } from 'react'
import { CCard, CCardBody, CCardHeader, CCol } from '@coreui/react'
import ShiftProgressBar from './ShiftProgressBar'
import { hasShiftStarted, isTimeInShift, isWithinProductionHours } from './TimeUtils'
import {
  findLatestDataBeforeShift,
  calculateHourlyProduction,
  getAllData,
} from './ShiftCalculations'

const ShiftDetail = ({ shifts, selectedDate }) => {
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  // Define the start time for all shifts (07:00)
  const standardStartTime = 7 // 7 AM

  // Get current hour for display
  const getCurrentHour = () => {
    return currentTime.getHours()
  }

  // Get current minute for display
  const getCurrentMinute = () => {
    return currentTime.getMinutes()
  }

  // Parse the selected date
  const parsedSelectedDate = new Date(selectedDate)

  // Check if we're looking at historical data (not today)
  const isHistoricalView = () => {
    const today = new Date()
    return (
      parsedSelectedDate.getDate() !== today.getDate() ||
      parsedSelectedDate.getMonth() !== today.getMonth() ||
      parsedSelectedDate.getFullYear() !== today.getFullYear()
    )
  }

  // Get all data across shifts
  const allShiftData = getAllData(shifts)

  return (
    <>
      <h2>Detail Production</h2>
      {shifts.map((shift, index) => {
        // Get shift hours - ensure we're using the correct hours as defined in the data
        const shiftHours = shift.hours || [
          '07:00',
          '08:00',
          '09:00',
          '10:00',
          '11:00',
          '12:00',
          '13:00',
          '14:00',
        ]

        // Parse shift start and end hours
        const shiftStartHour = shiftHours[0]
        const shiftEndHour = shiftHours[shiftHours.length - 1]

        const startHourNum = parseInt(shiftStartHour.split(':')[0], 10)
        const endHourNum = parseInt(shiftEndHour.split(':')[0], 10)

        // For historical data, always show all shifts
        // For today's data, only show shifts that have started
        let shiftHasStarted = true
        if (!isHistoricalView()) {
          shiftHasStarted = hasShiftStarted(shiftStartHour, getCurrentHour(), getCurrentMinute())
        }

        // If shift hasn't started yet, don't render it
        if (!shiftHasStarted) {
          return null
        }

        // Determine if current time falls within this shift (only relevant for today)
        const currentHour = getCurrentHour()
        const currentMinute = getCurrentMinute()
        const isActiveShift =
          !isHistoricalView() &&
          isTimeInShift(currentHour, currentMinute, shiftStartHour, shiftEndHour)

        // Find the latest data before this shift starts
        const latestBeforeShift = findLatestDataBeforeShift(
          allShiftData,
          shiftStartHour,
          isHistoricalView()
            ? new Date(parsedSelectedDate.getTime() + 24 * 60 * 60 * 1000)
            : currentTime,
        )

        // Calculate hourly production values
        const hourlyProduction = calculateHourlyProduction(
          shift.data,
          shiftHours,
          isHistoricalView()
            ? new Date(parsedSelectedDate.getTime() + 24 * 60 * 60 * 1000)
            : currentTime,
        )

        return (
          <CCol md={12} key={index}>
            <CCard className="mb-3">
              <CCardHeader className="text-body">
                <strong>{shift.name}</strong>
                {isActiveShift && <span className="badge bg-success ms-2">Active</span>}
              </CCardHeader>
              <CCardBody className="p-4">
                <ShiftProgressBar
                  shift={shift}
                  shiftHours={shiftHours}
                  startHourNum={startHourNum}
                  endHourNum={endHourNum}
                  latestBeforeShift={latestBeforeShift}
                  isActiveShift={isActiveShift}
                  currentTime={
                    isHistoricalView()
                      ? new Date(parsedSelectedDate.getTime() + 24 * 60 * 60 * 1000)
                      : currentTime
                  }
                  hourlyProduction={hourlyProduction}
                  isWithinProductionHours={
                    isHistoricalView()
                      ? true
                      : isWithinProductionHours(currentTime.getHours(), standardStartTime)
                  }
                  isHistoricalView={isHistoricalView()}
                />
              </CCardBody>
            </CCard>
          </CCol>
        )
      })}
    </>
  )
}

export default ShiftDetail
