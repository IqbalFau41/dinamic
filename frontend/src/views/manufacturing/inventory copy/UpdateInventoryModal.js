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

export const UpdateInventoryModal = ({
  updateItem,
  setUpdateItem,
  fetchInventories,
  showSuccess,
  setError,
}) => {
  const [updatingInventory, setUpdatingInventory] = useState(false)

  const handleUpdateInventory = async () => {
    if (!updateItem) return

    setUpdatingInventory(true)
    try {
      const response = await axios.put(
        `${getApiUrl('inventory')}/${updateItem.no_part}`,
        updateItem,
      )
      showSuccess(`Inventaris ${updateItem.name_part} telah berhasil diperbarui`)
      fetchInventories()
      setUpdateItem(null)
      console.log('Inventory updated successfully:', response.data)
    } catch (error) {
      console.error('Error updating inventory:', error.response?.data || error.message)
      setError(
        `Gagal memperbarui inventaris: ${error.response?.data?.error || error.message}. Silakan coba lagi nanti.`,
      )
    } finally {
      setUpdatingInventory(false)
    }
  }

  return (
    <CModal visible={!!updateItem} onClose={() => setUpdateItem(null)}>
      <CModalHeader>
        <CModalTitle>Perbarui Inventaris</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CFormInput label="ID" value={updateItem?.no_part || ''} disabled className="mb-3" />
        <CFormInput
          label="Nama Part"
          value={updateItem?.name_part || ''}
          onChange={(e) => setUpdateItem({ ...updateItem, name_part: e.target.value })}
          className="mb-3"
        />
        <CFormInput
          label="Tipe Part"
          value={updateItem?.type_part || ''}
          onChange={(e) => setUpdateItem({ ...updateItem, type_part: e.target.value })}
          className="mb-3"
        />
        <CFormInput
          label="Maker"
          value={updateItem?.maker_part || ''}
          onChange={(e) => setUpdateItem({ ...updateItem, maker_part: e.target.value })}
          className="mb-3"
        />
        <CFormInput
          label="Kuantitas"
          type="number"
          value={updateItem?.qty_part || ''}
          onChange={(e) => setUpdateItem({ ...updateItem, qty_part: e.target.value })}
          className="mb-3"
        />
        <CFormInput
          label="Informasi"
          value={updateItem?.information_part || ''}
          onChange={(e) => setUpdateItem({ ...updateItem, information_part: e.target.value })}
          className="mb-3"
        />
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => setUpdateItem(null)}>
          Batal
        </CButton>
        <CButton color="primary" onClick={handleUpdateInventory} disabled={updatingInventory}>
          {updatingInventory ? (
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
