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
import { cilPen, cilTrash, cilSearch, cilPlus } from '@coreui/icons'
import axios from 'axios'
import './Inventory.scss'
import { TableHeader } from './TableHeader'
import { AddInventoryModal } from './AddInventoryModal'
import { UpdateInventoryModal } from './UpdateInventoryModal'
import { DeleteInventoryModal } from './DeleteInventoryModal'
import { getApiUrl } from '../../../../src/utils/apiUtils'

const Inventory = () => {
  // State declarations
  const [inventories, setInventories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState({ column: 'name_part', direction: 'asc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(50)
  const [deleteItem, setDeleteItem] = useState(null)
  const [updateItem, setUpdateItem] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newInventory, setNewInventory] = useState({
    no_part: '',
    name_part: '',
    type_part: '',
    maker_part: '',
    qty_part: '',
    location_part: '',
    factory_part: '',
    information_part: '',
  })

  // Fetch data function
  const fetchInventories = async () => {
    setLoading(true)
    try {
      const response = await axios.get(getApiUrl('inventory'))
      setInventories(response.data || [])
      setError(null)
    } catch (error) {
      console.error('Error fetching inventory list:', error)
      setError('Gagal memuat daftar inventaris. Silakan coba lagi nanti.')
    } finally {
      setLoading(false)
    }
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchInventories()
  }, [])

  // Handle notifications
  const showSuccess = (message) => {
    setSuccessMessage(message)
    setTimeout(() => {
      setSuccessMessage(null)
    }, 3000)
  }

  // Action handlers
  const handleUpdate = (inventory) => {
    setUpdateItem(inventory)
  }

  const handleSort = (column) => {
    const direction = sortOrder.column === column && sortOrder.direction === 'asc' ? 'desc' : 'asc'
    setSortOrder({ column, direction })
  }

  // Data processing logic
  const sortedAndFilteredInventories = React.useMemo(() => {
    const filtered = inventories.filter((item) =>
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
  }, [inventories, searchTerm, sortOrder])

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = sortedAndFilteredInventories.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(sortedAndFilteredInventories.length / itemsPerPage)

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
    <CRow className="inventory-page">
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
            <strong>Daftar Inventaris</strong>
            <div className="search-container">
              <CFormInput
                type="text"
                placeholder="Cari berdasarkan nama atau ID part..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-2"
                startContent={<CIcon icon={cilSearch} />}
              />
            </div>
          </CCardHeader>

          <CCardBody>
            <CButton color="primary" onClick={() => setShowAddModal(true)}>
              <CIcon icon={cilPlus} className="me-1" /> Tambah Inventaris
            </CButton>

            <div className="fixed-header">
              <TableHeader column="no_part" sortOrder={sortOrder} handleSort={handleSort}>
                ID
              </TableHeader>
              <TableHeader column="name_part" sortOrder={sortOrder} handleSort={handleSort}>
                Nama Part
              </TableHeader>
              <TableHeader column="type_part" sortOrder={sortOrder} handleSort={handleSort}>
                Tipe Part
              </TableHeader>
              <TableHeader column="maker_part" sortOrder={sortOrder} handleSort={handleSort}>
                Maker
              </TableHeader>
              <TableHeader column="qty_part" sortOrder={sortOrder} handleSort={handleSort}>
                Kuantitas
              </TableHeader>
              <TableHeader column="location_part" sortOrder={sortOrder} handleSort={handleSort}>
                Lokasi
              </TableHeader>
              <TableHeader column="factory_part" sortOrder={sortOrder} handleSort={handleSort}>
                Factory
              </TableHeader>
              <TableHeader column="information_part" sortOrder={sortOrder} handleSort={handleSort}>
                Informasi
              </TableHeader>
              <div className="fixed-header-cell">Aksi</div>
            </div>

            <div className="table-container">
              <CTable striped hover responsive className="responsive-table">
                <CTableBody>
                  {currentItems.length > 0 ? (
                    currentItems.map((inventory) => (
                      <CTableRow key={inventory.no_part}>
                        <CTableDataCell>{inventory.no_part}</CTableDataCell>
                        <CTableDataCell>{inventory.name_part}</CTableDataCell>
                        <CTableDataCell>{inventory.type_part || '-'}</CTableDataCell>
                        <CTableDataCell>{inventory.maker_part || '-'}</CTableDataCell>
                        <CTableDataCell>{inventory.qty_part}</CTableDataCell>
                        <CTableDataCell>{inventory.location_part || '-'}</CTableDataCell>
                        <CTableDataCell>{inventory.factory_part || '-'}</CTableDataCell>
                        <CTableDataCell>{inventory.information_part || '-'}</CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex gap-1">
                            <CButton
                              color="warning"
                              size="sm"
                              onClick={() => handleUpdate(inventory)}
                              title="Edit"
                            >
                              <CIcon icon={cilPen} />
                            </CButton>
                            <CButton
                              color="danger"
                              size="sm"
                              onClick={() => setDeleteItem(inventory)}
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
                      <CTableDataCell colSpan="8" className="text-center">
                        Tidak ada data inventaris yang tersedia
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
        <AddInventoryModal
          visible={showAddModal}
          onClose={() => setShowAddModal(false)}
          newInventory={newInventory}
          setNewInventory={setNewInventory}
          fetchInventories={fetchInventories}
          showSuccess={showSuccess}
          setError={setError}
        />

        <DeleteInventoryModal
          deleteItem={deleteItem}
          setDeleteItem={setDeleteItem}
          fetchInventories={fetchInventories}
          showSuccess={showSuccess}
          setError={setError}
        />

        <UpdateInventoryModal
          updateItem={updateItem}
          setUpdateItem={setUpdateItem}
          fetchInventories={fetchInventories}
          showSuccess={showSuccess}
          setError={setError}
        />
      </CCol>
    </CRow>
  )
}

export default Inventory
