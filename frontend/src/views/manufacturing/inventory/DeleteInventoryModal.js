import React, { useState } from 'react'
import {
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CSpinner,
} from '@coreui/react'
import axios from 'axios'
import { getApiUrl } from '../../../../src/utils/apiUtils'

export const DeleteInventoryModal = ({
  deleteItem,
  setDeleteItem,
  fetchInventories,
  showSuccess,
  setError,
}) => {
  const [deletingInventory, setDeletingInventory] = useState(false)

  const handleDelete = async () => {
    if (!deleteItem) return

    setDeletingInventory(true)
    try {
      await axios.delete(`${getApiUrl('inventory')}/${deleteItem.no_part}`)
      showSuccess(`Inventaris ${deleteItem.name_part} telah berhasil dihapus`)
      fetchInventories()
      setDeleteItem(null)
    } catch (error) {
      console.error('Error deleting inventory:', error.response?.data || error.message)
      setError(
        `Gagal menghapus inventaris: ${error.response?.data?.error || error.message}. Silakan coba lagi nanti.`,
      )
    } finally {
      setDeletingInventory(false)
    }
  }

  return (
    <CModal visible={!!deleteItem} onClose={() => setDeleteItem(null)}>
      <CModalHeader>
        <CModalTitle>Konfirmasi Hapus</CModalTitle>
      </CModalHeader>
      <CModalBody>
        Apakah Anda yakin ingin menghapus inventaris ini:
        <br />
        <strong>ID: {deleteItem?.no_part}</strong>
        <br />
        <strong>Nama Part: {deleteItem?.name_part}</strong>
        <br />
        <strong>Tipe: {deleteItem?.type_part || '-'}</strong>
        <br />
        <strong>Kuantitas: {deleteItem?.qty_part}</strong>
        <br />
        <strong>Lokasi: {deleteItem?.location_part || '-'}</strong>
        <strong>Factory: {deleteItem?.factory_part || '-'}</strong>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => setDeleteItem(null)}>
          Batal
        </CButton>
        <CButton color="danger" onClick={handleDelete} disabled={deletingInventory}>
          {deletingInventory ? (
            <>
              <CSpinner size="sm" color="light" className="me-1" />
              Menghapus...
            </>
          ) : (
            'Hapus'
          )}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}
