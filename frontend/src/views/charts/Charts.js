import React from 'react'
import { CCard, CCardBody, CCardHeader, CCol, CRow, CProgress } from '@coreui/react'

const Tools = () => {
  // Sample project data
  const projects = [
    {
      name: 'Project AGV',
      progress: 70, // Progress percentage
      startDate: '01-01-2023',
      estimatedCompletion: '30-06-2023',
      budget: 'Rp 100.000.000',
    },
    {
      name: 'Project Mesin CNC',
      progress: 50,
      startDate: '15-02-2023',
      estimatedCompletion: '15-08-2023',
      budget: 'Rp 150.000.000',
    },
    {
      name: 'Project Mesin AMR Robot',
      progress: 30,
      startDate: '01-03-2023',
      estimatedCompletion: '01-12-2023',
      budget: 'Rp 200.000.000',
    },
  ]

  return (
    <CRow>
      {projects.map((project, index) => (
        <CCol xs={12} key={index} className="mb-4">
          <CCard>
            <CCardHeader>
              <strong>{project.name}</strong>
            </CCardHeader>
            <CCardBody>
              <CProgress value={project.progress} variant="striped" />
              <div className="mt-2">
                <strong>Progress: {project.progress}%</strong>
              </div>
              <div>
                <strong>Start Date:</strong> {project.startDate}
              </div>
              <div>
                <strong>Estimated Completion:</strong> {project.estimatedCompletion}
              </div>
              <div>
                <strong>Budget:</strong> {project.budget}
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      ))}
    </CRow>
  )
}

export default Tools
