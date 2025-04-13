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
import { Link } from 'react-router-dom'
import {
  getStatusConfig,
  generateDefaultSignal,
} from '../../utils/signalLightConfig/signalLightConfig.js'
import '../../scss/signalLightConfig.scss'

const Cikarang = () => {
  const [machineNames, setMachineNames] = useState([])
  const [lineGroups, setLineGroups] = useState([])
  const [selectedLineGroup, setSelectedLineGroup] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filteredMachines, setFilteredMachines] = useState([])
  const [location] = useState('CKR')

  // Fetch line groups
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

  // Fetch machine names and status
  useEffect(() => {
    const fetchMachineNames = async () => {
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
          const plan = 100 // You may want to define a way to get planned production
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
          }
        })

        setMachineNames(transformedData)
        setFilteredMachines(transformedData)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching machine data:', err)
        setError(err)
        setLoading(false)
      }
    }

    fetchMachineNames()
  }, [location, selectedLineGroup])

  // Handle line group change
  const handleLineGroupChange = (e) => {
    const lineGroup = e.target.value
    setSelectedLineGroup(lineGroup)

    if (lineGroup === '') {
      setFilteredMachines(machineNames)
    } else {
      setFilteredMachines(machineNames.filter((machine) => machine.lineGroup === lineGroup))
    }
  }

  // Error handling
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
          <h2>Cikarang Machine Monitor</h2>
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
                      to={`/cikarang/machine/${encodeURIComponent(data.no_mesin)}`}
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
                      <strong className="machine-name">{data.mesin}</strong>
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
