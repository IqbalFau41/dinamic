import React, { useState } from 'react'
import {
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormInput,
  CFormSelect,
  CSpinner,
} from '@coreui/react'
import axios from 'axios'
import { getApiUrl } from '../../../../src/utils/apiUtils'

export const UpdateJobModal = ({ updateItem, setUpdateItem, fetchJobs, showSuccess, setError }) => {
  const [updatingJob, setUpdatingJob] = useState(false)

  const handleUpdateJob = async () => {
    if (!updateItem) return

    setUpdatingJob(true)
    try {
      const response = await axios.put(`${getApiUrl('job-list')}/${updateItem.NRP}`, updateItem)
      showSuccess(`Pekerjaan ${updateItem.NAME} telah berhasil diperbarui`)
      fetchJobs()
      setUpdateItem(null)
      console.log('Job updated successfully:', response.data)
    } catch (error) {
      console.error('Error updating job:', error.response?.data || error.message)
      setError(
        `Gagal memperbarui pekerjaan: ${error.response?.data?.error || error.message}. Silakan coba lagi nanti.`,
      )
    } finally {
      setUpdatingJob(false)
    }
  }

  return (
    <CModal visible={!!updateItem} onClose={() => setUpdateItem(null)}>
      <CModalHeader>
        <CModalTitle>Perbarui Pekerjaan</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CFormInput label="NRP" value={updateItem?.NRP || ''} disabled className="mb-3" />
        <CFormInput
          label="Nama"
          value={updateItem?.NAME || ''}
          onChange={(e) => setUpdateItem({ ...updateItem, NAME: e.target.value })}
          className="mb-3"
        />
        <CFormInput
          label="Deskripsi Pekerjaan"
          value={updateItem?.JOB_DESC || ''}
          onChange={(e) => setUpdateItem({ ...updateItem, JOB_DESC: e.target.value })}
          className="mb-3"
        />
        <CFormInput
          label="Job Class"
          value={updateItem?.JOB_CLASS || ''}
          onChange={(e) => setUpdateItem({ ...updateItem, JOB_CLASS: e.target.value })}
          className="mb-3"
        />
        <CFormInput
          label="Pabrik"
          value={updateItem?.FACTORY || ''}
          onChange={(e) => setUpdateItem({ ...updateItem, FACTORY: e.target.value })}
          className="mb-3"
        />
        <CFormInput
          label="Tanggal Jatuh Tempo"
          type="date"
          value={updateItem?.DUE_DATE?.split('T')[0] || ''}
          onChange={(e) => setUpdateItem({ ...updateItem, DUE_DATE: e.target.value })}
          className="mb-3"
        />
        <CFormSelect
          label="Status"
          value={updateItem?.STATUS || ''}
          onChange={(e) => setUpdateItem({ ...updateItem, STATUS: e.target.value })}
          options={[
            { label: 'Pilih Status', value: '' },
            { label: 'PENDING', value: 'PENDING' },
            { label: 'IN PROGRESS', value: 'IN PROGRESS' },
            { label: 'ORDER', value: 'ORDER' },
            { label: 'PR', value: 'PR' },
            { label: 'COMPLETED', value: 'COMPLETED' },
          ]}
          className="mb-3"
        />
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => setUpdateItem(null)}>
          Batal
        </CButton>
        <CButton color="primary" onClick={handleUpdateJob} disabled={updatingJob}>
          {updatingJob ? (
            <>
              <CSpinner size="sm" color="light" className="me-1" />
              Memperbarui...
            </>
          ) : (
            'Perbarui'
          )}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}
