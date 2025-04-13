import React from 'react'
import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react'

const FormControl = () => {
  const cards = [
    {
      No: 1,
      JenisMesin: 'Conveyor Otomatis',
      PekerjaanPreventif: [
        'Pemeriksaan kondisi belt conveyor',
        'Membersihkan area roller',
        'Pelumasan bearing',
      ],
      Frekuensi: ['Mingguan', 'Bulanan', 'Bulanan'],
      Tanggal: ['01-01-2023', '01-02-2023', '01-02-2023'],
      AlatBahan: ['Kunci pas, pelumas, kain lap', 'Kuas, air, deterjen', 'Pelumas bearing'],
      Catatan: [
        'Ganti jika belt mulai aus',
        'Hindari penumpukan debu/kotoran',
        'Gunakan pelumas sesuai rekomend asi',
      ],
    },
    {
      No: 2,
      JenisMesin: 'Robot Lengan (Robotic Arm)',
      PekerjaanPreventif: [
        'Kalibrasi posisi lengan',
        'Pengecekan kabel dan konektor',
        'Pelumasan sendi mekanik',
      ],
      Frekuensi: ['Bulanan', 'Bulanan', 'Bulanan'],
      Tanggal: ['01-01-2023', '01-02-2023', '01-02-2023'],
      AlatBahan: ['Alat kalibrasi, laptop (software)', 'Multimeter', 'Pelumas khusus robot'],
      Catatan: [
        'Pastikan kalibrasi sesuai standar',
        'Ganti kabel yang mulai retak',
        'Gunakan pelumas sesuai spesifikasi',
      ],
    },
    {
      No: 3,
      JenisMesin: 'Mesin CNC',
      PekerjaanPreventif: [
        'Pemeriksaan coolant',
        'Membersihkan filter',
        'Pemeriksaan dan pelumasan rel',
      ],
      Frekuensi: ['Mingguan', 'Bulanan', 'Bulanan'],
      Tanggal: ['01-01-2023', '01-02-2023', '01-02-2023'],
      AlatBahan: [
        'Coolant baru, alat ukur pH',
        'Filter baru (jika perlu)',
        'Pelumas rel, kain lap',
      ],
      Catatan: [
        'Pastikan pH sesuai spesifikasi',
        'Ganti filter jika tersumbat',
        'Rel harus bersih dari kotoran',
      ],
    },
    {
      No: 1,
      JenisMesin: 'Conveyor Otomatis',
      PekerjaanPreventif: [
        'Pemeriksaan kondisi belt conveyor',
        'Membersihkan area roller',
        'Pelumasan bearing',
      ],
      Frekuensi: ['Mingguan', 'Bulanan', 'Bulanan'],
      Tanggal: ['01-01-2023', '01-02-2023', '01-02-2023'],
      AlatBahan: ['Kunci pas, pelumas, kain lap', 'Kuas, air, deterjen', 'Pelumas bearing'],
      Catatan: [
        'Ganti jika belt mulai aus',
        'Hindari penumpukan debu/kotoran',
        'Gunakan pelumas sesuai rekomend asi',
      ],
    },
    {
      No: 2,
      JenisMesin: 'Robot Lengan (Robotic Arm)',
      PekerjaanPreventif: [
        'Kalibrasi posisi lengan',
        'Pengecekan kabel dan konektor',
        'Pelumasan sendi mekanik',
      ],
      Frekuensi: ['Bulanan', 'Bulanan', 'Bulanan'],
      Tanggal: ['01-01-2023', '01-02-2023', '01-02-2023'],
      AlatBahan: ['Alat kalibrasi, laptop (software)', 'Multimeter', 'Pelumas khusus robot'],
      Catatan: [
        'Pastikan kalibrasi sesuai standar',
        'Ganti kabel yang mulai retak',
        'Gunakan pelumas sesuai spesifikasi',
      ],
    },
    {
      No: 3,
      JenisMesin: 'Mesin CNC',
      PekerjaanPreventif: [
        'Pemeriksaan coolant',
        'Membersihkan filter',
        'Pemeriksaan dan pelumasan rel',
      ],
      Frekuensi: ['Mingguan', 'Bulanan', 'Bulanan'],
      Tanggal: ['01-01-2023', '01-02-2023', '01-02-2023'],
      AlatBahan: [
        'Coolant baru, alat ukur pH',
        'Filter baru (jika perlu)',
        'Pelumas rel, kain lap',
      ],
      Catatan: [
        'Pastikan pH sesuai spesifikasi',
        'Ganti filter jika tersumbat',
        'Rel harus bersih dari kotoran',
      ],
    },
  ]

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Kegiatan Preventif</strong>
          </CCardHeader>
          <CCardBody>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Jenis Mesin</th>
                  <th>Pekerjaan Preventif</th>
                  <th>Frekuensi</th>
                  <th>Tanggal Pelaksanaan</th>
                  <th>Alat/Bahan yang Dibutuhkan</th>
                  <th>Catatan</th>
                </tr>
              </thead>
              <tbody>
                {cards.map((card) => (
                  <tr key={card.No}>
                    <td>{card.No}</td>
                    <td>{card.JenisMesin}</td>
                    <td>{card.PekerjaanPreventif.join(', ')}</td>
                    <td>{card.Frekuensi.join(', ')}</td>
                    <td>{card.Tanggal.join(', ')}</td>
                    <td>{card.AlatBahan.join(', ')}</td>
                    <td>{card.Catatan.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default FormControl
