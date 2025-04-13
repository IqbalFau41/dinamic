import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CSpinner,
  CProgress,
  CFormSelect,
  CBadge,
} from '@coreui/react'
import { Link, useParams } from 'react-router-dom'
import {
  getStatusConfig,
  generateDefaultSignal,
} from '../../utils/signalLightConfig/signalLightConfig.js'
import '../../scss/signalLightConfig.scss'

const MachineMonitor = () => {
  // Changed default to be handled by conditional logic instead
  const { location } = useParams()
  // Use the provided location or default to 'CKR'
  const currentLocation = (location || 'CKR').toUpperCase()

  const [machineNames, setMachineNames] = useState([])
  const [lineGroups, setLineGroups] = useState([])
  const [selectedLineGroup, setSelectedLineGroup] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filteredMachines, setFilteredMachines] = useState([])

  // Updated to explicitly handle both location codes
  const getLocationDisplayName = () => {
    if (currentLocation === 'CKR') return 'Cikarang'
    if (currentLocation === 'KRW') return 'Karawang'
    return currentLocation // Fallback for any other codes
  }

  useEffect(() => {
    const fetchLineGroups = async () => {
      try {
        console.log(`Fetching line groups for ${currentLocation}`)
        const response = await axios.get(`/api/machine-names/${currentLocation}/line-groups`)
        setLineGroups(response.data.map((group) => group.LINE_GROUP))
      } catch (err) {
        console.error(`Error fetching line groups for ${currentLocation}:`, err)
        setError(err)
      }
    }

    fetchLineGroups()
    setSelectedLineGroup('')
  }, [currentLocation])

  useEffect(() => {
    const fetchMachineData = async () => {
      try {
        setLoading(true)
        const params = selectedLineGroup ? { params: { lineGroup: selectedLineGroup } } : {}

        console.log(`Fetching machine data for ${currentLocation}`)
        const [machineResponse, statusResponse] = await Promise.all([
          axios.get(`/api/machine-names/${currentLocation}`, params),
          axios.get(`/api/machine-status/all/${currentLocation}`),
        ])

        const machineStatuses = statusResponse.data.reduce((acc, status) => {
          acc[status.NoMachine] = status
          return acc
        }, {})

        const transformedData = machineResponse.data.map((machine) => {
          const machineStatus = machineStatuses[machine.MACHINE_CODE] || {}
          const statusConfig = getStatusConfig(machineStatus.Status || 'Shutdown')

          const actual = 0 // Placeholder
          const plan = 100 // Placeholder
          const performance = 0 // Placeholder

          return {
            no_mesin: machine.MACHINE_CODE,
            mesin: machine.MACHINE_NAME,
            lineGroup: machine.LINE_GROUP,
            status: machineStatus.Status || 'Shutdown',
            message: statusConfig.displayName,
            Plan: plan,
            actual: actual,
            performance: `${performance}%`,
            startTime: null,
            endTime: null,
            cycleTime: null,
          }
        })

        setMachineNames(transformedData)
        setFilteredMachines(transformedData)
        setLoading(false)
      } catch (err) {
        console.error(`Error fetching machine data for ${currentLocation}:`, err)
        setError(err)
        setLoading(false)
      }
    }

    fetchMachineData()
  }, [currentLocation, selectedLineGroup])

  const handleLineGroupChange = (e) => {
    const lineGroup = e.target.value
    setSelectedLineGroup(lineGroup)

    if (lineGroup === '') {
      setFilteredMachines(machineNames)
    } else {
      setFilteredMachines(machineNames.filter((machine) => machine.lineGroup === lineGroup))
    }
  }

  if (error) {
    return (
      <CRow>
        <CCol className="text-center text-danger">
          Error loading machine names: {error.message}
        </CCol>
      </CRow>
    )
  }

  return (
    <>
      <CRow className="mb-3">
        <CCol>
          <h2>{getLocationDisplayName()} Machine Monitor</h2>
        </CCol>
      </CRow>

      <CRow className="mb-3 align-items-center">
        <CCol md={4}>
          <CFormSelect value={selectedLineGroup} onChange={handleLineGroupChange}>
            <option value="">All Line Groups</option>
            {lineGroups.map((group, index) => (
              <option key={index} value={group}>
                {group}
              </option>
            ))}
          </CFormSelect>
        </CCol>
        <CCol md={8} className="text-end">
          <CBadge color="primary" shape="rounded-pill" className="px-3 py-2">
            Total Machines: {filteredMachines.length}
          </CBadge>
        </CCol>
      </CRow>

      {loading ? (
        <CRow>
          <CCol className="text-center">
            <CSpinner color="primary" />
          </CCol>
        </CRow>
      ) : (
        <CRow className="d-flex align-items-stretch">
          {filteredMachines.map((data, index) => {
            const { borderColor, headerColor } = getStatusConfig(data.status)
            const signalClasses = generateDefaultSignal(data.status)
            const progress = data.actual ? Math.min((data.actual / (data.Plan || 1)) * 100, 100) : 0

            return (
              <CCol md={2} sm={2} className="mb-4 px-2" key={index}>
                <CCard className="machine-card-wrapper mb-4" style={{ borderColor }}>
                  <CCardHeader
                    className="machine-card-header"
                    style={{ backgroundColor: headerColor }}
                  >
                    <Link
                      to={`/${getLocationDisplayName().toLowerCase()}/machine/${encodeURIComponent(data.no_mesin)}`}
                      style={{
                        color: 'white',
                        textDecoration: 'none',
                        cursor: 'pointer',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textTransform: 'uppercase',
                        textAlign: 'center',
                      }}
                    >
                      <strong className="machine-code">{data.no_mesin}</strong>
                      <span className="machine-name">{data.mesin}</span>
                    </Link>
                  </CCardHeader>

                  <CCardBody className="machine-card-body">
                    <div className="status-message">
                      <strong
                        title={
                          data.startTime
                            ? `Last updated: ${new Date(data.startTime).toLocaleString()}`
                            : ''
                        }
                      >
                        {data.message}
                      </strong>
                    </div>

                    <div className="machine-info-container">
                      <div className="signal-tower">
                        {signalClasses.map((signalClass, i) => {
                          const isGreenLight = i === 2
                          const isNormalOperation = data.status.toLowerCase() === 'normal operation'

                          return (
                            <div
                              key={i}
                              className={`signal ${signalClass} ${isNormalOperation && isGreenLight ? 'blinking' : ''}`}
                            />
                          )
                        })}
                      </div>

                      <div className="machine-details">
                        <p>
                          <strong>No. Mesin:</strong> {data.no_mesin}
                        </p>
                        <p>
                          <strong>Plan:</strong> {data.Plan}
                        </p>
                        <div className="metric-container">
                          <strong>Actual:</strong> {data.actual}
                          <CProgress height={10} value={progress} />
                        </div>
                        <div className="metric-container">
                          <strong>Performance:</strong> {data.performance}
                          <CProgress
                            height={10}
                            value={parseFloat(data.performance.replace('%', ''))}
                          />
                        </div>
                      </div>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>
            )
          })}
        </CRow>
      )}
    </>
  )
}

export default MachineMonitor
