import React, { useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CButtonGroup,
  CProgress,
  CProgressStacked,
  CPopover,
} from '@coreui/react'
import './Sc_Camshaft.css'

const machinesData = {
  'Shift 1': [
    {
      name: '11003 MANUAL LATHE OKUMA',
      actual: 150,
      status: 'Normal Operation',
      progressValues: [10],
      progressValues2: [30],
      progressValues3: [10],
    },
    {
      name: 'EBW - DRILL CARRIER 23015-23017-23018',
      actual: 50,
      status: 'Stop Line',
      progressValues: [20],
      progressValues2: [20],
      progressValues3: [20],
    },
    {
      name: 'ASSY GEAR COMP PLANETARY 62030',
      actual: 50,
      status: 'Stop Line',
      progressValues: [30],
      progressValues2: [35],
      progressValues3: [15],
    },
  ],
  'Shift 2': [
    {
      name: '11003 MANUAL LATHE OKUMA',
      actual: 100,
      status: 'Stop Line',
      progressValues: [20],
      progressValues2: [10],
      progressValues3: [30],
    },
    {
      name: 'EBW - DRILL CARRIER 23015-23017-23018',
      actual: 75,
      status: 'Normal Operation',
      progressValues: [30],
      progressValues2: [10],
      progressValues3: [30],
    },
    {
      name: 'ASSY GEAR COMP PLANETARY 62030',
      actual: 60,
      status: 'Normal Operation',
      progressValues: [50],
      progressValues2: [5],
      progressValues3: [5],
    },
  ],
  'Shift 3': [
    {
      name: '11003 MANUAL LATHE OKUMA',
      actual: 80,
      status: 'Stop Line',
      progressValues: [10],
      progressValues2: [10],
      progressValues3: [10],
    },
    {
      name: 'EBW - DRILL CARRIER 23015-23017-23018',
      actual: 65,
      status: 'Normal Operation',
      progressValues: [5],
      progressValues2: [35],
      progressValues3: [50],
    },
    {
      name: 'ASSY GEAR COMP PLANETARY 62030',
      actual: 55,
      status: 'Stop Line',
      progressValues: [25],
      progressValues2: [5],
      progressValues3: [30],
    },
  ],
}

const shifts = [
  {
    name: 'Shift 1',
    hours: [
      '07:00',
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
    ],
  },
  {
    name: 'Shift 2',
    hours: [
      '16:00',
      '17:00',
      '18:00',
      '19:00',
      '20:00',
      '21:00',
      '22:00',
      '23:00',
      '00:00',
      '01:00',
    ],
  },
  {
    name: 'Shift 3',
    hours: ['01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00'],
  },
]

const Sc_Camshaft = () => {
  const [selectedShift, setSelectedShift] = useState('Shift 1')

  return (
    <div>
      <CRow>
        <CCol md={12}>
          <CCard className="mb-3">
            <CCardHeader className="text-body d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">Detail Mesin</h5>
              </div>
              <CButtonGroup role="group" aria-label="Shift Selection">
                {shifts.map((shift) => (
                  <CButton
                    key={shift.name}
                    color={selectedShift === shift.name ? 'primary' : 'outline-primary'}
                    onClick={() => setSelectedShift(shift.name)}
                  >
                    {shift.name}
                  </CButton>
                ))}
              </CButtonGroup>
            </CCardHeader>

            <CCardBody className="p-4">
              <CRow>
                <CCol md={12}>
                  <table className="table table-bordered machine-status-table">
                    <thead>
                      <tr>
                        <th className="text-center" style={{ width: '15%' }}>
                          Mesin
                        </th>
                        <th className="text-center" style={{ width: '8%' }}>
                          Actual
                        </th>
                        <th className="text-center" style={{ width: '8%' }}>
                          Status
                        </th>
                        <th className="text-start" style={{ width: '70%' }}>
                          {shifts.find((shift) => shift.name === selectedShift).hours.join(' | ')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {machinesData[selectedShift].map((machine, machineIndex) => (
                        <tr key={machineIndex}>
                          <td className="text-center">{machine.name}</td>
                          <td className="text-center">{machine.actual}</td>
                          <td className="text-center">{machine.status}</td>
                          <td className="padded-cell">
                            <div className="grid-container">
                              <div className="progress-container">
                                <CProgressStacked>
                                  <CPopover
                                    content={`Value: ${machine.progressValues[0]}`}
                                    placement="right"
                                    trigger={['hover', 'focus']}
                                  >
                                    <CProgress color="success" value={machine.progressValues[0]} />
                                  </CPopover>
                                  <CPopover
                                    content={`Value: ${machine.progressValues2[0]}`}
                                    placement="right"
                                    trigger={['hover', 'focus']}
                                  >
                                    <CProgress color="danger" value={machine.progressValues2[0]} />
                                  </CPopover>
                                  <CPopover
                                    content={`Value: ${machine.progressValues3[0]}`}
                                    placement="right"
                                    trigger={['hover', 'focus']}
                                  >
                                    <CProgress color="warning" value={machine.progressValues3[0]} />
                                  </CPopover>
                                </CProgressStacked>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  )
}

export default Sc_Camshaft
