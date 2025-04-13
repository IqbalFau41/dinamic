import React, { useState, useEffect, useRef } from 'react'
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
import { Link } from 'react-router-dom'
import {
  getStatusConfig,
  generateDefaultSignal,
} from '../../utils/signalLightConfig/signalLightConfig.js'
import '../../scss/signalLightConfig.scss'

const Karawang = () => {
  const [machineNames, setMachineNames] = useState([])
  const [lineGroups, setLineGroups] = useState([])
  const [selectedLineGroup, setSelectedLineGroup] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filteredMachines, setFilteredMachines] = useState([])
  const [location] = useState('KRW')
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [socketConnected, setSocketConnected] = useState(false)

  // WebSocket reference
  const socketRef = useRef(null)

  // Konversi kode lokasi ke nama untuk URL
  const locationUrlName = location === 'KRW' ? 'karawang' : 'cikarang'

  // Fetch line groups once
  useEffect(() => {
    const fetchLineGroups = async () => {
      try {
        const response = await axios.get(`/api/machine-names/${location}/line-groups`)
        setLineGroups(response.data.map((group) => group.LINE_GROUP))
      } catch (err) {
        console.error('Error fetching line groups:', err)
        setError(err)
      }
    }

    fetchLineGroups()
  }, [location])

  // Initial data fetch
  const fetchInitialData = async () => {
    try {
      setLoading(true)

      // Make parallel API calls for machine names and production history
      const [machineResponse, historyResponse] = await Promise.all([
        axios.get(`/api/machine-names/${location}`, {
          params: selectedLineGroup ? { lineGroup: selectedLineGroup } : undefined,
        }),
        axios.get(`/api/machine-history/${location}`, {
          params: selectedLineGroup ? { lineGroup: selectedLineGroup } : undefined,
        }),
      ])

      // Transform machine data
      const transformedData = machineResponse.data.map((machine) => {
        // Find the most recent history record for this machine
        const machineHistory =
          historyResponse.data
            .filter((history) => history.MachineCode === machine.MACHINE_CODE)
            .sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt))[0] || {}

        const statusConfig = getStatusConfig(machineHistory.OPERATION_NAME || 'Shutdown')

        // Calculate performance metrics
        const actual = machineHistory.MACHINE_COUNTER || 0
        const plan = 1000 // You may want to define a way to get planned production
        const performance = plan > 0 ? Math.round((actual / plan) * 100) : 0

        return {
          no_mesin: machine.MACHINE_CODE,
          mesin: machine.MACHINE_NAME,
          lineGroup: machine.LINE_GROUP,
          status: machineHistory.OPERATION_NAME || 'Shutdown',
          message: statusConfig.displayName,
          Plan: plan,
          actual: actual,
          performance: `${performance}%`,
          startTime: machineHistory.CreatedAt,
          statusConfig: statusConfig,
        }
      })

      setMachineNames(transformedData)
      applyLineGroupFilter(transformedData)
      setLastUpdate(new Date())
      setLoading(false)
    } catch (err) {
      console.error('Error fetching initial machine data:', err)
      setError(err)
      setLoading(false)
    }
  }

  // Apply filtering based on selected line group
  const applyLineGroupFilter = (machines) => {
    if (selectedLineGroup === '') {
      setFilteredMachines(machines)
    } else {
      setFilteredMachines(machines.filter((machine) => machine.lineGroup === selectedLineGroup))
    }
  }

  // Setup WebSocket connection
  useEffect(() => {
    // Fetch initial data first
    fetchInitialData()

    // Establish WebSocket connection
    const setupWebSocket = () => {
      // Use secure WebSocket if on HTTPS, otherwise standard WebSocket
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const host = window.location.host

      // Build URL with query parameters for location and lineGroup
      let wsUrl = `${protocol}//${host}/ws/machines?location=${location}`
      if (selectedLineGroup) {
        wsUrl += `&lineGroup=${selectedLineGroup}`
      }

      if (socketRef.current) {
        socketRef.current.close()
      }

      const socket = new WebSocket(wsUrl)

      socket.onopen = () => {
        console.log('WebSocket connection established')
        setSocketConnected(true)
      }

      socket.onmessage = (event) => {
        try {
          const messageData = JSON.parse(event.data)

          // Check if this is a machineData message
          if (messageData.type === 'machineData') {
            setMachineNames(messageData.data)
            applyLineGroupFilter(messageData.data)
            setLastUpdate(new Date(messageData.timestamp))
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error)
        }
      }

      socket.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason)
        setSocketConnected(false)

        // Attempt to reconnect after a delay if not closed intentionally
        if (event.code !== 1000) {
          setTimeout(() => {
            console.log('Attempting to reconnect WebSocket...')
            setupWebSocket()
          }, 3000)
        }
      }

      socket.onerror = (error) => {
        console.error('WebSocket error:', error)
        setSocketConnected(false)
      }

      socketRef.current = socket
    }

    setupWebSocket()

    // Cleanup WebSocket on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close()
      }
    }
  }, [location, selectedLineGroup]) // Include selectedLineGroup in dependencies

  // Handle line group change
  const handleLineGroupChange = (e) => {
    const lineGroup = e.target.value
    setSelectedLineGroup(lineGroup)
  }

  // Manual refresh function
  const handleManualRefresh = () => {
    fetchInitialData()
  }

  // Send filter update to WebSocket server
  const updateFilters = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: 'setFilters',
          location: location,
          lineGroup: selectedLineGroup,
        }),
      )
    }
  }

  // Update filters when line group changes
  useEffect(() => {
    updateFilters()
    // Also apply filtering to existing machine data
    applyLineGroupFilter(machineNames)
  }, [selectedLineGroup])

  // Error handling
  if (error) {
    return (
      <CRow>
        <CCol className="text-center text-danger">
          Error loading machine names: {error.message}
          <div className="mt-3">
            <button className="btn btn-primary" onClick={handleManualRefresh}>
              Retry
            </button>
          </div>
        </CCol>
      </CRow>
    )
  }

  return (
    <>
      <CRow className="mb-3">
        <CCol md={6}>
          <h2>Karawang Machine Monitor</h2>
        </CCol>
        <CCol md={6} className="text-end">
          <div className="d-flex justify-content-end align-items-center">
            <CBadge
              color={socketConnected ? 'success' : 'danger'}
              shape="rounded-pill"
              className="me-3 px-3 py-2"
            >
              {socketConnected ? 'Connected' : 'Disconnected'}
            </CBadge>
            <span className="me-3">Last updated: {lastUpdate.toLocaleTimeString()}</span>
            <button
              className="btn btn-outline-primary"
              onClick={handleManualRefresh}
              disabled={loading}
            >
              {loading ? <CSpinner size="sm" /> : <span>↻ Refresh</span>}
            </button>
          </div>
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

      {/* Main Content Area */}
      {loading ? (
        <CRow>
          <CCol className="text-center">
            <CSpinner color="primary" />
          </CCol>
        </CRow>
      ) : (
        <CRow className="d-flex align-items-stretch">
          {filteredMachines.map((data, index) => {
            const statusConfig = data.statusConfig || getStatusConfig(data.status)
            const { borderColor, headerColor } = statusConfig
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
                      to={`/${locationUrlName}/machine/${encodeURIComponent(data.no_mesin)}`}
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

export default Karawang
