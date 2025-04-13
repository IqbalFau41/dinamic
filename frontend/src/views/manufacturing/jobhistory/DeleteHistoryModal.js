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

export const DeleteHistoryModal = ({
  deleteItem,
  setDeleteItem,
  fetchJobHistory,
  showSuccess,
  setError,
}) => {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteItem) return

    setDeleting(true)
    try {
      await axios.delete(`${getApiUrl('job-history')}/${deleteItem.NRP}`)
      showSuccess(`Riwayat pekerjaan ${deleteItem.NAME} telah berhasil dihapus`)
      fetchJobHistory()
      setDeleteItem(null)
    } catch (error) {
      console.error('Error deleting job history:', error.response?.data || error.message)
      setError(
        `Gagal menghapus riwayat pekerjaan: ${error.response?.data?.error || error.message}. Silakan coba lagi nanti.`,
      )
    } finally {
      setDeleting(false)
    }
  }

  return (
    <CModal visible={!!deleteItem} onClose={() => setDeleteItem(null)}>
      <CModalHeader>
        <CModalTitle>Konfirmasi Hapus</CModalTitle>
      </CModalHeader>
      <CModalBody>
        Apakah Anda yakin ingin menghapus riwayat pekerjaan:
        <br />
        <strong>NRP: {deleteItem?.NRP}</strong>
        <br />
        <strong>Nama: {deleteItem?.NAME}</strong>
        <br />
        <strong>Deskripsi Pekerjaan: {deleteItem?.JOB_DESC}</strong>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => setDeleteItem(null)}>
          Batal
        </CButton>
        <CButton color="danger" onClick={handleDelete} disabled={deleting}>
          {deleting ? (
            <>
              <CSpinner size="sm" color="light" className="me-1" />
              Memproses...
            </>
          ) : (
            'Hapus'
          )}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}
