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
      // Create a copy of the inventory data without the no_part field
      const inventoryData = { ...newInventory }
      // If no_part exists in the object, delete it to prevent SQL Server identity insert error
      if ('no_part' in inventoryData) {
        delete inventoryData.no_part
      }
      await axios.post(getApiUrl('inventory'), inventoryData)

      showSuccess(`Inventaris baru ${newInventory.name_part} berhasil ditambahkan`)
      onClose()
      setNewInventory({
        name_part: '',
        type_part: '',
        maker_part: '',
        qty_part: '',
        location_part: '',
        factory_part: '',
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
          label="Lokasi"
          value={newInventory.location_part}
          onChange={(e) => setNewInventory({ ...newInventory, location_part: e.target.value })}
          className="mb-3"
          required
        />
        <CFormInput
          label="Factory"
          value={newInventory.factory_part}
          onChange={(e) => setNewInventory({ ...newInventory, factory_part: e.target.value })}
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
