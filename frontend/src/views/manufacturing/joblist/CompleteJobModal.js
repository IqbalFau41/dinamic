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

export const CompleteJobModal = ({
  completeItem,
  setCompleteItem,
  fetchJobs,
  showSuccess,
  setError,
}) => {
  const [completingJob, setCompletingJob] = useState(false)

  const handleComplete = async () => {
    if (!completeItem) return

    setCompletingJob(true)
    try {
      const response = await axios.post(
        `${getApiUrl('job-history')}/move-to-history/${completeItem.NRP}`,
      )
      showSuccess(`Pekerjaan ${completeItem.NAME} telah berhasil diselesaikan`)
      fetchJobs()
      setCompleteItem(null)
      console.log('Job completed successfully:', response.data)
    } catch (error) {
      console.error('Error completing job:', error.response?.data || error.message)
      setError(
        `Gagal menyelesaikan pekerjaan: ${error.response?.data?.error || error.message}. Silakan coba lagi nanti.`,
      )
    } finally {
      setCompletingJob(false)
    }
  }

  return (
    <CModal visible={!!completeItem} onClose={() => setCompleteItem(null)}>
      <CModalHeader>
        <CModalTitle>Konfirmasi Penyelesaian Pekerjaan</CModalTitle>
      </CModalHeader>
      <CModalBody>
        Apakah Anda yakin pekerjaan ini telah selesai:
        <br />
        <strong>NRP: {completeItem?.NRP}</strong>
        <br />
        <strong>Nama: {completeItem?.NAME}</strong>
        <br />
        <strong>Deskripsi Pekerjaan: {completeItem?.JOB_DESC}</strong>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => setCompleteItem(null)}>
          Batal
        </CButton>
        <CButton color="success" onClick={handleComplete} disabled={completingJob}>
          {completingJob ? (
            <>
              <CSpinner size="sm" color="light" className="me-1" />
              Memproses...
            </>
          ) : (
            'Selesai'
          )}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}
