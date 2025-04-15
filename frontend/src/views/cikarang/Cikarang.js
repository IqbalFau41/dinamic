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
import { getApiUrl, getWebSocketUrl } from '../../utils/apiUtils'

const Cikarang = () => {
  const [machineNames, setMachineNames] = useState([])
  const [lineGroups, setLineGroups] = useState([])
  const [selectedLineGroup, setSelectedLineGroup] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filteredMachines, setFilteredMachines] = useState([])
  const [location] = useState('CKR')
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
        const response = await axios.get(getApiUrl(`machine-names/${location}/line-groups`))
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

      // Coba ambil data dari cache terlebih dahulu
      const cachedDataKey = `machineData-${location}-${selectedLineGroup || 'all'}`
      const cachedData = localStorage.getItem(cachedDataKey)

      if (cachedData) {
        try {
          const parsedData = JSON.parse(cachedData)
          const cacheTime = localStorage.getItem(`${cachedDataKey}-timestamp`)
          const cacheAge = cacheTime ? Date.now() - parseInt(cacheTime) : 0

          // Gunakan cache jika umurnya kurang dari 5 menit
          if (cacheAge < 5 * 60 * 1000) {
            setMachineNames(parsedData)
            applyLineGroupFilter(parsedData)
            setLoading(false)
            console.log('Menggunakan data cache')
          }
        } catch (e) {
          console.error('Error parsing cached data:', e)
        }
      }

      // Pertama ambil dulu data nama mesin untuk UI dasar
      const machineResponse = await axios.get(getApiUrl(`machine-names/${location}`), {
        params: selectedLineGroup ? { lineGroup: selectedLineGroup } : undefined,
      })

      // Transform data mesin dengan nilai default
      const basicMachineData = machineResponse.data.map((machine) => {
        return {
          no_mesin: machine.MACHINE_CODE,
          mesin: machine.MACHINE_NAME,
          lineGroup: machine.LINE_GROUP,
          status: 'Loading...',
          message: 'Loading...',
          Plan: 0,
          actual: 0,
          performance: '0%',
          startTime: new Date(),
          statusConfig: getStatusConfig('Shutdown'),
        }
      })

      // Tampilkan basic UI mesin segera
      setMachineNames(basicMachineData)
      applyLineGroupFilter(basicMachineData)
      setLoading(false)

      // Kemudian ambil data history
      const historyResponse = await axios.get(getApiUrl(`machine-history/${location}`), {
        params: selectedLineGroup ? { lineGroup: selectedLineGroup } : undefined,
      })

      // Update dengan data lengkap
      const transformedData = machineResponse.data.map((machine) => {
        // Find the most recent history record for this machine
        const machineHistory =
          historyResponse.data
            .filter((history) => history.MachineCode === machine.MACHINE_CODE)
            .sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt))[0] || {}

        const statusConfig = getStatusConfig(machineHistory.OPERATION_NAME || 'Shutdown')
        if (
          statusConfig.headerColor === '#666' ||
          statusConfig.headerColor === 'rgb(102, 102, 102)'
        ) {
          // Ganti dengan warna default yang lebih baik (misalnya biru)
          statusConfig.headerColor = '#0d6efd' // warna biru bootstrap
          statusConfig.borderColor = '#0d6efd'
        }
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

      // Simpan ke cache
      localStorage.setItem(cachedDataKey, JSON.stringify(transformedData))
      localStorage.setItem(`${cachedDataKey}-timestamp`, Date.now().toString())

      setMachineNames(transformedData)
      applyLineGroupFilter(transformedData)
      setLastUpdate(new Date())
    } catch (err) {
      console.error('Error fetching initial machine data:', err)
      setError(err)
      setLoading(false)
    }
  }

  // Apply filtering based on selected line group
  const applyLineGroupFilter = (machines) => {
    let filteredResults

    if (selectedLineGroup === '') {
      filteredResults = machines
    } else {
      filteredResults = machines.filter((machine) => machine.lineGroup === selectedLineGroup)
    }

    // Preserve existing status configs when possible
    if (filteredMachines.length > 0) {
      filteredResults = filteredResults.map((newMachine) => {
        // Find matching machine in current filtered list
        const existingMachine = filteredMachines.find((m) => m.no_mesin === newMachine.no_mesin)

        // If found and status hasn't changed, keep existing statusConfig
        if (existingMachine && existingMachine.status === newMachine.status) {
          return {
            ...newMachine,
            statusConfig: existingMachine.statusConfig,
          }
        }

        return newMachine
      })
    }

    setFilteredMachines(filteredResults)
  }

  // Setup WebSocket connection
  useEffect(() => {
    // Fetch initial data first
    fetchInitialData()

    // Establish WebSocket connection
    const setupWebSocket = () => {
      // Build WebSocket URL hanya dengan parameter location (tanpa lineGroup)
      let wsUrl = getWebSocketUrl(`ws/machines?location=${location}`)

      if (socketRef.current) {
        socketRef.current.close()
      }

      const socket = new WebSocket(wsUrl)

      socket.onopen = () => {
        console.log('WebSocket connection established')
        setSocketConnected(true)

        // Setelah koneksi terbuka, kirim filter lineGroup jika ada
        if (selectedLineGroup) {
          socket.send(
            JSON.stringify({
              type: 'setFilters',
              location: location,
              lineGroup: selectedLineGroup,
            }),
          )
        }
      }

      socket.onmessage = (event) => {
        try {
          const messageData = JSON.parse(event.data)

          // Check if this is a machineData message
          if (messageData.type === 'machineData') {
            // Make sure each machine has a valid statusConfig with correct colors
            const updatedData = messageData.data.map((machine) => {
              // Use existing statusConfig when possible
              const existingMachine = machineNames.find((m) => m.no_mesin === machine.no_mesin)

              // Always get fresh statusConfig (never use gray color)
              const freshStatusConfig = getStatusConfig(machine.status)

              // Merge with existing config if status hasn't changed
              if (
                existingMachine &&
                existingMachine.status === machine.status &&
                existingMachine.statusConfig &&
                existingMachine.statusConfig.headerColor !== '#666' &&
                existingMachine.statusConfig.headerColor !== 'rgb(102, 102, 102)'
              ) {
                return {
                  ...machine,
                  statusConfig: existingMachine.statusConfig,
                }
              }

              return {
                ...machine,
                statusConfig: freshStatusConfig,
              }
            })

            setMachineNames(updatedData)
            applyLineGroupFilter(updatedData)
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
  }, [location])
  // Handle line group change
  const handleLineGroupChange = (e) => {
    const lineGroup = e.target.value
    setSelectedLineGroup(lineGroup)

    // Langsung terapkan filter lokal untuk UX yang lebih responsif
    if (machineNames.length > 0) {
      if (lineGroup === '') {
        setFilteredMachines(machineNames)
      } else {
        setFilteredMachines(machineNames.filter((machine) => machine.lineGroup === lineGroup))
      }
    }
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
    // Jika socket sudah terhubung, kirim update filter
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: 'setFilters',
          location: location,
          lineGroup: selectedLineGroup,
        }),
      )
    }
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
          <h2>Cikarang Machine Monitor</h2>
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
      {loading && filteredMachines.length === 0 ? (
        <CRow>
          <CCol className="text-center">
            <CSpinner color="primary" />
          </CCol>
        </CRow>
      ) : (
        <CRow className="d-flex align-items-stretch">
          {filteredMachines.map((data, index) => {
            // Existing machine card rendering code
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

export default Cikarang
