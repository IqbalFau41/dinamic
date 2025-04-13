import React, { useMemo } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'
import { getOperationColor } from '../CProgress/ShiftCalculations'

const TabelOperation = ({ shifts, selectedDate }) => {
  // Calculate operation durations across all shifts
  const operationStats = useMemo(() => {
    // Get all data points from all shifts
    const allData = shifts.flatMap((shift) => shift.data || [])

    if (allData.length === 0) return []

    // Sort data by timestamp
    const sortedData = [...allData].sort(
      (a, b) => new Date(a.CreatedAt).getTime() - new Date(b.CreatedAt).getTime(),
    )

    // Track operation durations
    const operationDurations = {}

    // Process data points to calculate durations
    for (let i = 0; i < sortedData.length - 1; i++) {
      const currentRecord = sortedData[i]
      const nextRecord = sortedData[i + 1]

      // Skip records with missing operation name
      if (!currentRecord.OPERATION_NAME) continue

      const operationType = currentRecord.OPERATION_NAME.trim()
      const startTime = new Date(currentRecord.CreatedAt).getTime()
      const endTime = new Date(nextRecord.CreatedAt).getTime()

      // Calculate duration in minutes
      const durationMinutes = (endTime - startTime) / (1000 * 60)

      // Only count reasonable durations (less than 24 hours)
      if (durationMinutes > 0 && durationMinutes < 24 * 60) {
        if (!operationDurations[operationType]) {
          operationDurations[operationType] = {
            name: operationType,
            totalMinutes: 0,
            color: getOperationColor(operationType),
            occurrences: 0,
          }
        }

        operationDurations[operationType].totalMinutes += durationMinutes
        operationDurations[operationType].occurrences += 1
      }
    }

    // Convert to array and sort by total duration (descending)
    return Object.values(operationDurations)
      .map((op) => ({
        ...op,
        formattedDuration: formatDuration(op.totalMinutes),
        averageDuration: formatDuration(op.totalMinutes / op.occurrences),
      }))
      .sort((a, b) => b.totalMinutes - a.totalMinutes)
  }, [shifts])

  // Format minutes into hours and minutes
  const formatDuration = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60)
    const minutes = Math.floor(totalMinutes % 60)

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  // Generate color badge for status
  const renderStatusBadge = (operationType, color) => {
    return (
      <div className="d-flex align-items-center">
        <div
          className={`me-2 rounded-circle bg-${color}`}
          style={{ width: '15px', height: '15px' }}
        ></div>
        {operationType}
      </div>
    )
  }

  return (
    <CCard className="mb-4">
      <CCardHeader className="text-body">
        <strong>Machine Operation Summary</strong>
      </CCardHeader>
      <CCardBody>
        {operationStats.length === 0 ? (
          <p className="text-center py-3">No operation data available for this period</p>
        ) : (
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell scope="col">#</CTableHeaderCell>
                <CTableHeaderCell scope="col">Operation Status</CTableHeaderCell>
                <CTableHeaderCell scope="col">Total Duration</CTableHeaderCell>
                <CTableHeaderCell scope="col">Occurrences</CTableHeaderCell>
                <CTableHeaderCell scope="col">Average Duration</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {operationStats.map((operation, index) => (
                <CTableRow key={index}>
                  <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                  <CTableDataCell>
                    {renderStatusBadge(operation.name, operation.color)}
                  </CTableDataCell>
                  <CTableDataCell>{operation.formattedDuration}</CTableDataCell>
                  <CTableDataCell>{operation.occurrences}</CTableDataCell>
                  <CTableDataCell>{operation.averageDuration}</CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>
    </CCard>
  )
}

export default TabelOperation
