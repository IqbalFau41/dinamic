import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CSpinner,
  CPagination,
  CPaginationItem,
  CTable,
  CTableBody,
  CTableRow,
  CTableDataCell,
  CButton,
  CFormInput,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPen, cilCheck, cilSearch, cilPlus, cilSync } from '@coreui/icons'
import axios from 'axios'
import './JobList.scss'
import { TableHeader } from './TableHeader'
import { AddJobModal } from './AddJobModal'
import { UpdateJobModal } from './UpdateJobModal'
import { CompleteJobModal } from './CompleteJobModal'
import { formatDate } from './JobListUtils'
import { getApiUrl } from '../../../../src/utils/apiUtils'

const JobList = () => {
  // State declarations
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState({ column: 'NAME', direction: 'asc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(50)
  const [completeItem, setCompleteItem] = useState(null)
  const [updateItem, setUpdateItem] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newJob, setNewJob] = useState({
    NRP: '',
    NAME: '',
    JOB_CLASS: '',
    JOB_DESC: '',
    FACTORY: '',
    DUE_DATE: '',
    STATUS: 'PENDING',
  })

  // Fetch data function
  const fetchJobs = async () => {
    setLoading(true)
    try {
      const response = await axios.get(getApiUrl('job-list'))
      setJobs(response.data || [])
      setError(null)
    } catch (error) {
      console.error('Error fetching job list:', error)
      setError('Gagal memuat daftar pekerjaan. Silakan coba lagi nanti.')
    } finally {
      setLoading(false)
    }
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchJobs()
  }, [])

  // Handle notifications
  const showSuccess = (message) => {
    setSuccessMessage(message)
    setTimeout(() => {
      setSuccessMessage(null)
    }, 3000)
  }

  // Action handlers
  const handleUpdate = (job) => {
    setUpdateItem(job)
  }

  const handleSort = (column) => {
    const direction = sortOrder.column === column && sortOrder.direction === 'asc' ? 'desc' : 'asc'
    setSortOrder({ column, direction })
  }

  // Get appropriate icon for status - This is the part we're removing as it doesn't seem to be used
  // const getStatusIcon = (status) => {
  //   switch (status?.toLowerCase()) {
  //     case 'in progress':
  //       return cilSync
  //     case 'completed':
  //       return cilCheck
  //     default:
  //       return null
  //   }
  // }

  // Data processing logic
  const sortedAndFilteredJobs = React.useMemo(() => {
    const filtered = jobs.filter((item) =>
      Object.values(item).some(
        (value) =>
          value &&
          typeof value === 'string' &&
          value.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    )

    return [...filtered].sort((a, b) => {
      const aValue = a[sortOrder.column] || ''
      const bValue = b[sortOrder.column] || ''

      if (sortOrder.direction === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [jobs, searchTerm, sortOrder])

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = sortedAndFilteredJobs.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(sortedAndFilteredJobs.length / itemsPerPage)

  // Pagination handler
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  // Loading spinner display
  if (loading) {
    return (
      <div className="spinner-container">
        <CSpinner color="primary" />
      </div>
    )
  }

  // Main component render
  return (
    <CRow className="job-list-page">
      <CCol xs={12}>
        {error && (
          <CAlert color="danger" dismissible onClose={() => setError(null)}>
            {error}
          </CAlert>
        )}
        {successMessage && (
          <CAlert color="success" dismissible onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </CAlert>
        )}

        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center flex-wrap">
            <strong>Daftar Pekerjaan Karyawan</strong>
            <div className="search-container">
              <CFormInput
                type="text"
                placeholder="Cari berdasarkan nama atau deskripsi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-2"
                startContent={<CIcon icon={cilSearch} />}
              />
            </div>
          </CCardHeader>

          <CCardBody>
            <CButton color="primary" onClick={() => setShowAddModal(true)}>
              <CIcon icon={cilPlus} className="me-1" /> Tambah Pekerjaan
            </CButton>

            <div className="fixed-header">
              <TableHeader column="NRP" sortOrder={sortOrder} handleSort={handleSort}>
                NRP
              </TableHeader>
              <TableHeader column="NAME" sortOrder={sortOrder} handleSort={handleSort}>
                Nama
              </TableHeader>
              <TableHeader column="JOB_CLASS" sortOrder={sortOrder} handleSort={handleSort}>
                Job Class
              </TableHeader>
              <TableHeader column="JOB_DESC" sortOrder={sortOrder} handleSort={handleSort}>
                Deskripsi Pekerjaan
              </TableHeader>
              <TableHeader column="FACTORY" sortOrder={sortOrder} handleSort={handleSort}>
                Factory
              </TableHeader>
              <TableHeader column="DUE_DATE" sortOrder={sortOrder} handleSort={handleSort}>
                Tenggat
              </TableHeader>
              <TableHeader column="STATUS" sortOrder={sortOrder} handleSort={handleSort}>
                Status
              </TableHeader>
              <TableHeader column="created_at" sortOrder={sortOrder} handleSort={handleSort}>
                Dibuat Pada
              </TableHeader>
              <div className="fixed-header-cell">Aksi</div>
            </div>

            <div className="table-container">
              <CTable striped hover responsive className="responsive-table">
                <CTableBody>
                  {currentItems.length > 0 ? (
                    currentItems.map((job) => (
                      <CTableRow key={job.NRP}>
                        <CTableDataCell>{job.NRP}</CTableDataCell>
                        <CTableDataCell>{job.NAME}</CTableDataCell>
                        <CTableDataCell>{job.JOB_CLASS}</CTableDataCell>
                        <CTableDataCell>{job.JOB_DESC}</CTableDataCell>
                        <CTableDataCell>{job.FACTORY}</CTableDataCell>
                        <CTableDataCell>{formatDate(job.DUE_DATE)}</CTableDataCell>
                        <CTableDataCell>
                          <span className={`status-badge status-${job.STATUS?.toLowerCase()}`}>
                            {job.STATUS || 'N/A'}
                          </span>
                        </CTableDataCell>
                        <CTableDataCell>{formatDate(job.created_at)}</CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex gap-1">
                            <CButton
                              color="warning"
                              size="sm"
                              onClick={() => handleUpdate(job)}
                              title="Edit"
                            >
                              <CIcon icon={cilPen} />
                            </CButton>
                            <CButton
                              color="success"
                              size="sm"
                              onClick={() => setCompleteItem(job)}
                              title="Selesai"
                            >
                              <CIcon icon={cilCheck} />
                            </CButton>
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan="9" className="text-center">
                        Tidak ada data pekerjaan yang tersedia
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            </div>

            {totalPages > 1 && (
              <CPagination className="mt-3 justify-content-center">
                <CPaginationItem
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </CPaginationItem>
                {[...Array(totalPages)].map((_, index) => (
                  <CPaginationItem
                    key={index + 1}
                    active={currentPage === index + 1}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </CPaginationItem>
                ))}
                <CPaginationItem
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </CPaginationItem>
              </CPagination>
            )}
          </CCardBody>
        </CCard>

        {/* Modal Components */}
        <AddJobModal
          visible={showAddModal}
          onClose={() => setShowAddModal(false)}
          newJob={newJob}
          setNewJob={setNewJob}
          fetchJobs={fetchJobs}
          showSuccess={showSuccess}
          setError={setError}
        />

        <CompleteJobModal
          completeItem={completeItem}
          setCompleteItem={setCompleteItem}
          fetchJobs={fetchJobs}
          showSuccess={showSuccess}
          setError={setError}
        />

        <UpdateJobModal
          updateItem={updateItem}
          setUpdateItem={setUpdateItem}
          fetchJobs={fetchJobs}
          showSuccess={showSuccess}
          setError={setError}
        />
      </CCol>
    </CRow>
  )
}

export default JobList
