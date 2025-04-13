import React, { useState } from 'react'
import {
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormInput,
  CSpinner,
} from '@coreui/react'
import axios from 'axios'
import { getApiUrl } from '../../../../src/utils/apiUtils'

export const AddInventoryModal = ({
  visible,
  onClose,
  newInventory,
  setNewInventory,
  fetchInventories,
  showSuccess,
  setError,
}) => {
  const [addingInventory, setAddingInventory] = useState(false)

  const handleAddInventory = async () => {
    setAddingInventory(true)
    try {
      await axios.post(getApiUrl('inventory'), newInventory)
      showSuccess(`Inventaris baru ${newInventory.name_part} berhasil ditambahkan`)
      onClose()
      setNewInventory({
        no_part: '',
        name_part: '',
        type_part: '',
        maker_part: '',
        qty_part: '',
        information_part: '',
      })
      fetchInventories()
    } catch (error) {
      console.error('Error adding inventory:', error.response?.data || error.message)
      setError(
        `Gagal menambahkan inventaris: ${error.response?.data?.error || error.message}. Silakan coba lagi nanti.`,
      )
    } finally {
      setAddingInventory(false)
    }
  }

  return (
    <CModal visible={visible} onClose={onClose}>
      <CModalHeader>
        <CModalTitle>Tambah Inventaris Baru</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CFormInput
          label="ID"
          value={newInventory.no_part}
          onChange={(e) => setNewInventory({ ...newInventory, no_part: e.target.value })}
          className="mb-3"
          required
        />
        <CFormInput
          label="Nama Part"
          value={newInventory.name_part}
          onChange={(e) => setNewInventory({ ...newInventory, name_part: e.target.value })}
          className="mb-3"
          required
        />
        <CFormInput
          label="Tipe Part"
          value={newInventory.type_part}
          onChange={(e) => setNewInventory({ ...newInventory, type_part: e.target.value })}
          className="mb-3"
          required
        />
        <CFormInput
          label="Maker"
          value={newInventory.maker_part}
          onChange={(e) => setNewInventory({ ...newInventory, maker_part: e.target.value })}
          className="mb-3"
          required
        />
        <CFormInput
          label="Kuantitas"
          type="number"
          value={newInventory.qty_part}
          onChange={(e) => setNewInventory({ ...newInventory, qty_part: e.target.value })}
          className="mb-3"
          required
        />
        <CFormInput
          label="Informasi"
          value={newInventory.information_part}
          onChange={(e) => setNewInventory({ ...newInventory, information_part: e.target.value })}
          className="mb-3"
        />
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>
          Batal
        </CButton>
        <CButton color="primary" onClick={handleAddInventory} disabled={addingInventory}>
          {addingInventory ? (
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
