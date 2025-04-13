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
import { cilTrash, cilSearch } from '@coreui/icons'
import axios from 'axios'
import './JobHistory.scss'
import { TableHeader } from './TableHeader'
import { DeleteHistoryModal } from './DeleteHistoryModal'
import { formatDate } from './JobListUtils'
import { getApiUrl } from '../../../../src/utils/apiUtils'

const JobHistory = () => {
  // State declarations
  const [jobHistory, setJobHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState({ column: 'COMPLETION_DATE', direction: 'desc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(50)
  const [deleteItem, setDeleteItem] = useState(null)

  // Fetch data function
  const fetchJobHistory = async () => {
    setLoading(true)
    try {
      const response = await axios.get(getApiUrl('job-history'))
      setJobHistory(response.data || [])
      setError(null)
    } catch (error) {
      console.error('Error fetching job history:', error)
      setError('Gagal memuat riwayat pekerjaan. Silakan coba lagi nanti.')
    } finally {
      setLoading(false)
    }
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchJobHistory()
  }, [])

  // Handle notifications
  const showSuccess = (message) => {
    setSuccessMessage(message)
    setTimeout(() => {
      setSuccessMessage(null)
    }, 3000)
  }

  // Sort handler
  const handleSort = (column) => {
    const direction = sortOrder.column === column && sortOrder.direction === 'asc' ? 'desc' : 'asc'
    setSortOrder({ column, direction })
  }

  // Data processing logic
  const sortedAndFilteredHistory = React.useMemo(() => {
    const filtered = jobHistory.filter((item) =>
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
  }, [jobHistory, searchTerm, sortOrder])

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = sortedAndFilteredHistory.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(sortedAndFilteredHistory.length / itemsPerPage)

  // Pagination handler
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  // Handle delete
  const handleDelete = (job) => {
    setDeleteItem(job)
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
    <CRow className="job-history-page">
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
            <strong>Riwayat Pekerjaan Karyawan</strong>
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
                Lokasi
              </TableHeader>
              <TableHeader column="STATUS" sortOrder={sortOrder} handleSort={handleSort}>
                Status
              </TableHeader>
              <TableHeader
                column="ORIGINAL_CREATED_AT"
                sortOrder={sortOrder}
                handleSort={handleSort}
              >
                Tanggal Dibuat
              </TableHeader>
              <TableHeader column="COMPLETION_DATE" sortOrder={sortOrder} handleSort={handleSort}>
                Tanggal Selesai
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
                        <CTableDataCell>
                          <span className={`status-badge status-${job.STATUS?.toLowerCase()}`}>
                            {job.STATUS || 'N/A'}
                          </span>
                        </CTableDataCell>
                        <CTableDataCell>{formatDate(job.ORIGINAL_CREATED_AT)}</CTableDataCell>
                        <CTableDataCell>{formatDate(job.COMPLETION_DATE)}</CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex gap-1">
                            <CButton
                              color="danger"
                              size="sm"
                              onClick={() => handleDelete(job)}
                              title="Hapus"
                            >
                              <CIcon icon={cilTrash} />
                            </CButton>
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan="9" className="text-center">
                        Tidak ada data riwayat pekerjaan yang tersedia
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
        <DeleteHistoryModal
          deleteItem={deleteItem}
          setDeleteItem={setDeleteItem}
          fetchJobHistory={fetchJobHistory}
          showSuccess={showSuccess}
          setError={setError}
        />
      </CCol>
    </CRow>
  )
}

export default JobHistory
