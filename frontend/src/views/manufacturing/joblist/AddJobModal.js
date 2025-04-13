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

export const AddJobModal = ({
  visible,
  onClose,
  newJob,
  setNewJob,
  fetchJobs,
  showSuccess,
  setError,
}) => {
  const [addingJob, setAddingJob] = useState(false)

  const handleAddJob = async () => {
    setAddingJob(true)
    try {
      await axios.post(getApiUrl('job-list'), newJob)
      showSuccess(`Pekerjaan baru untuk ${newJob.NAME} berhasil ditambahkan`)
      onClose()
      setNewJob({
        NRP: '',
        NAME: '',
        JOB_CLASS: '',
        JOB_DESC: '',
        FACTORY: '',
        DUE_DATE: '',
        STATUS: 'PENDING',
      })
      fetchJobs()
    } catch (error) {
      console.error('Error adding job:', error.response?.data || error.message)
      setError(
        `Gagal menambahkan pekerjaan: ${error.response?.data?.error || error.message}. Silakan coba lagi nanti.`,
      )
    } finally {
      setAddingJob(false)
    }
  }

  return (
    <CModal visible={visible} onClose={onClose}>
      <CModalHeader>
        <CModalTitle>Tambah Pekerjaan Baru</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CFormInput
          label="NRP"
          value={newJob.NRP}
          onChange={(e) => setNewJob({ ...newJob, NRP: e.target.value })}
          className="mb-3"
          required
        />
        <CFormInput
          label="Nama"
          value={newJob.NAME}
          onChange={(e) => setNewJob({ ...newJob, NAME: e.target.value })}
          className="mb-3"
          required
        />
        <CFormInput
          label="Job Class"
          value={newJob.JOB_CLASS}
          onChange={(e) => setNewJob({ ...newJob, JOB_CLASS: e.target.value })}
          className="mb-3"
          required
        />
        <CFormInput
          label="Deskripsi Pekerjaan"
          value={newJob.JOB_DESC}
          onChange={(e) => setNewJob({ ...newJob, JOB_DESC: e.target.value })}
          className="mb-3"
          required
        />
        <CFormInput
          label="Pabrik"
          value={newJob.FACTORY}
          onChange={(e) => setNewJob({ ...newJob, FACTORY: e.target.value })}
          className="mb-3"
          required
        />
        <CFormInput
          label="Tanggal Jatuh Tempo"
          type="date"
          value={newJob.DUE_DATE}
          onChange={(e) => setNewJob({ ...newJob, DUE_DATE: e.target.value })}
          className="mb-3"
          required
        />
        <CFormSelect
          label="Status"
          value={newJob.STATUS}
          onChange={(e) => setNewJob({ ...newJob, STATUS: e.target.value })}
          options={[
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
        <CButton color="secondary" onClick={onClose}>
          Batal
        </CButton>
        <CButton color="primary" onClick={handleAddJob} disabled={addingJob}>
          {addingJob ? (
            <>
              <CSpinner size="sm" color="light" className="me-1" />
              Menyimpan...
            </>
          ) : (
            'Simpan'
          )}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}
