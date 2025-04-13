import React from 'react'

// Karawang Plant
const AllKarawang = React.lazy(() => import('./views/karawang/allkarawang/AllKarawang.js'))
const Sc_Camshaft = React.lazy(() => import('./views/karawang/sc_camshaft/Sc_Camshaft.js'))

// Tool Control
const Tool_Control = React.lazy(() => import('./views/tool_control/Tool_Control.js'))

// Kanagata
const Kanagata = React.lazy(() => import('./views/kanagata/Kanagata.js'))
const Cikarang = React.lazy(() => import('./views/cikarang/Cikarang.js'))
const Karawang = React.lazy(() => import('./views/karawang/Karawang.js'))

// Maintenance
const Inventory = React.lazy(() => import('./views/manufacturing/inventory/Inventory.js'))
const JobList = React.lazy(() => import('./views/manufacturing/joblist/JobList.js'))
const JobHistory = React.lazy(() => import('./views/manufacturing/jobhistory/JobHistory.js'))

// Timeline Project
const Charts = React.lazy(() => import('./views/charts/Charts'))

// MachineDetail - Updated import location
const MachineDetail = React.lazy(() => import('./utils/machineDetail/MachineDetail.js'))

const routes = [
  // Karawang Plant
  { path: '/karawang/allkarawang', name: 'AllKarawang', element: AllKarawang },
  { path: '/karawang/sc_camshaft', name: 'Sc_Camshaft', element: Sc_Camshaft },

  // Tool Control
  { path: '/tool_control', name: 'Tool_Control', element: Tool_Control },

  // Kanagata
  { path: '/kanagata', name: 'Kanagata', element: Kanagata },
  { path: '/cikarang', name: 'Cikarang', element: Cikarang },
  { path: '/karawang', name: 'Karawang', element: Karawang },

  // Manufacturing
  { path: '/manufacturing/inventory', name: 'Inventory', element: Inventory },
  { path: '/manufacturing/jobhistory', name: 'JobHistory', element: JobHistory },
  { path: '/manufacturing/joblist', name: 'JobList', element: JobList },

  // Timeline Project
  { path: '/charts', name: 'Charts', element: Charts },

  // Machine Detail - Updated paths to use the new MachineDetail component
  { path: '/cikarang/machine/:name', name: 'MachineDetail', element: MachineDetail },
  { path: '/karawang/machine/:name', name: 'MachineDetail', element: MachineDetail },
]

export default routes
