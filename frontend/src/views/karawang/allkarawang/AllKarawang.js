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
} from '@coreui/react'
import { Link } from 'react-router-dom'

const Allkarawng = () => {
  const [machineNames, setMachineNames] = useState([])
  const [lineGroups, setLineGroups] = useState([])
  const [selectedLineGroup, setSelectedLineGroup] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const getColors = (status) => {
    switch (status.toLowerCase()) {
      case 'running':
        return {
          borderColor: 'var(--cui-success)',
          headerColor: 'var(--cui-success)',
          signal: [
            'signal-dark-red',
            'signal-dark-yellow',
            'signal-green',
            'signal-dark-blue',
            'signal-dark-white',
          ],
        }
      case 'warning':
        return {
          borderColor: 'var(--cui-warning)',
          headerColor: 'var(--cui-warning)',
          signal: [
            'signal-dark-red',
            'signal-yellow',
            'signal-dark-green',
            'signal-dark-blue',
            'signal-dark-white',
          ],
        }
      case 'stop':
        return {
          borderColor: 'var(--cui-danger)',
          headerColor: 'var(--cui-danger)',
          signal: [
            'signal-red',
            'signal-dark-yellow',
            'signal-dark-green',
            'signal-dark-blue',
            'signal-dark-white',
          ],
        }
      case 'little stop':
        return {
          borderColor: '#fc38da',
          headerColor: '#fc38da',
          signal: [
            'signal-dark-red',
            'signal-dark-yellow',
            'signal-dark-green',
            'signal-blue',
            'signal-dark-white',
          ],
        }
      case 'line stop':
        return {
          borderColor: '#c03fab',
          headerColor: '#c03fab',
          signal: [
            'signal-dark-green',
            'signal-dark-yellow',
            'signal-dark-red',
            'signal-blue',
            'signal-dark-white',
          ],
        }
      case 'power off':
        return {
          borderColor: 'var(--cui-secondary)',
          headerColor: 'var(--cui-secondary)',
          signal: [
            'signal-dark-green',
            'signal-dark-yellow',
            'signal-dark-red',
            'signal-dark-blue',
            'signal-white',
          ],
        }
      default:
        return {
          borderColor: '#000',
          headerColor: '#000',
          signal: [
            'signal-dark-green',
            'signal-dark-yellow',
            'signal-dark-red',
            'signal-dark-blue',
            'signal-dark-white',
          ],
        }
    }
  }

  const generateSignal = (status) => {
    return [
      'signal-dark-green',
      'signal-dark-yellow',
      'signal-dark-red',
      'signal-dark-blue',
      'signal-dark-white',
    ]
  }

  useEffect(() => {
    const fetchLineGroups = async () => {
      try {
        const response = await axios.get('/api/machine-names/karawang/line-groups')
        setLineGroups(response.data.map((group) => group.LineGroup))
      } catch (err) {
        console.error('Error fetching line groups:', err)
      }
    }

    fetchLineGroups()
  }, [])

  useEffect(() => {
    const fetchMachineNames = async () => {
      try {
        setLoading(true)
        const params = selectedLineGroup ? { params: { lineGroup: selectedLineGroup } } : {}

        const response = await axios.get('/api/machine-names/karawang', params)
        setMachineNames(
          response.data.map((machine) => ({
            no_mesin: machine.Machine_Code,
            mesin: machine.LineName,
            lineGroup: machine.LineGroup,
            status: 'Running',
            message: 'Machine Status',
            Plan: 100,
            actual: 80,
            performance: '80%',
          })),
        )
        setLoading(false)
      } catch (err) {
        setError(err)
        setLoading(false)
      }
    }

    fetchMachineNames()
  }, [selectedLineGroup])

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
        <CCol md={4}>
          <CFormSelect
            value={selectedLineGroup}
            onChange={(e) => setSelectedLineGroup(e.target.value)}
          >
            <option value="">All Line Groups</option>
            {lineGroups.map((group, index) => (
              <option key={index} value={group}>
                {group}
              </option>
            ))}
          </CFormSelect>
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
          {machineNames.map((data, index) => {
            const { borderColor, headerColor, signal } = getColors(data.status)
            const signalClasses = generateSignal(data.status)

            const progress = data.actual ? Math.min((data.actual / (data.Plan || 1)) * 100, 100) : 0

            return (
              <CCol md={2} sm={2} className="mb-4 px-2" key={index}>
                <CCard
                  className="mb-4"
                  style={{
                    borderColor: borderColor,
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    height: '100%',
                  }}
                >
                  <CCardHeader
                    style={{
                      backgroundColor: headerColor,
                      color: 'white',
                      height: '50px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '5px 10px',
                    }}
                  >
                    <Link
                      to={`/karawang/machine/${encodeURIComponent(data.no_mesin)}`}
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
                      <strong style={{ fontSize: '0.9em' }}>{data.no_mesin}</strong>
                      <span style={{ fontSize: '0.8em', opacity: 0.8 }}>{data.mesin}</span>
                    </Link>
                  </CCardHeader>
                  <CCardBody
                    style={{
                      padding: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      height: '100%',
                      alignItems: 'center',
                      marginBottom: '-8%',
                    }}
                  >
                    <div
                      style={{
                        textAlign: 'center',
                        marginBottom: '10px',
                        textTransform: 'uppercase',
                        width: '100%',
                      }}
                    >
                      <strong>{data.message}</strong>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        gap: '0px',
                        width: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <div
                        className="signal-tower"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          minWidth: '30px',
                          height: '100%',
                        }}
                      >
                        {signalClasses.map((signalClass, i) => (
                          <div
                            key={i}
                            className={`signal ${signalClass}`}
                            style={{
                              flex: '1',
                              width: '30px',
                              borderRadius: '2px',
                              minHeight: '25px',
                            }}
                          />
                        ))}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 5px 0' }}>
                          <strong>No. Mesin:</strong> {data.no_mesin}
                        </p>
                        <p style={{ margin: '0 0 5px 0' }}>
                          <strong>Plan:</strong> {data.Plan}
                        </p>
                        <div style={{ marginBottom: '5px' }}>
                          <strong>Actual:</strong> {data.actual}
                          <CProgress height={10} value={progress} />
                        </div>
                        <div>
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

export default Allkarawng
