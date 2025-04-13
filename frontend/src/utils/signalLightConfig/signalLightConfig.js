// src/utils/signalLightConfig.js

export const getStatusConfig = (status) => {
  const statusConfigs = {
    chokotei: {
      borderColor: 'var(--cui-danger)',
      headerColor: 'var(--cui-danger)',
      signal: [
        'signal-red',
        'signal-dark-yellow',
        'signal-dark-green',
        'signal-dark-blue',
        'signal-dark-white',
      ],
      displayName: 'Chokotei',
    },
    'normal operation': {
      borderColor: 'var(--cui-success)',
      headerColor: 'var(--cui-success)',
      signal: [
        'signal-dark-red', // Red light off
        'signal-dark-yellow', // Yellow light off
        'signal-green blinking', // Only green light blinks
        'signal-dark-blue', // Blue light off
        'signal-dark-white', // White light off
      ],
      displayName: 'Normal Operation',
    },
    maintenance: {
      borderColor: '#fc38da',
      headerColor: '#fc38da',
      signal: [
        'signal-dark-red',
        'signal-dark-yellow',
        'signal-dark-green',
        'signal-blue',
        'signal-dark-white',
      ],
      displayName: 'Maintenance',
    },
    'quality check': {
      borderColor: 'var(--cui-warning)',
      headerColor: 'var(--cui-warning)',
      signal: [
        'signal-dark-red',
        'signal-yellow',
        'signal-dark-green',
        'signal-dark-blue',
        'signal-dark-white',
      ],
      displayName: 'Quality Check',
    },
    'idle time': {
      borderColor: '#c03fab',
      headerColor: '#c03fab',
      signal: [
        'signal-dark-green',
        'signal-dark-yellow',
        'signal-dark-red',
        'signal-blue',
        'signal-dark-white',
      ],
      displayName: 'Idle Time',
    },
    production: {
      borderColor: 'var(--cui-success)',
      headerColor: 'var(--cui-success)',
      signal: [
        'signal-dark-red',
        'signal-dark-yellow',
        'signal-green',
        'signal-dark-blue',
        'signal-dark-white',
      ],
      displayName: 'Production',
    },
    shutdown: {
      borderColor: 'var(--cui-secondary)',
      headerColor: 'var(--cui-secondary)',
      signal: [
        'signal-dark-green',
        'signal-dark-yellow',
        'signal-dark-red',
        'signal-dark-blue',
        'signal-white',
      ],
      displayName: 'Shutdown',
    },
  }

  // Convert status to lowercase for case-insensitive matching
  const normalizedStatus = status.toLowerCase()

  // Return matching config or default config
  return (
    statusConfigs[normalizedStatus] || {
      borderColor: '#000',
      headerColor: '#000',
      signal: [
        'signal-dark-green',
        'signal-dark-yellow',
        'signal-dark-red',
        'signal-dark-blue',
        'signal-dark-white',
      ],
      displayName: status,
    }
  )
}

// Generates default signal array for machines without status
export const generateDefaultSignal = (status) => {
  const normalizedStatus = status.toLowerCase()

  if (normalizedStatus === 'normal operation') {
    return [
      'signal-dark-red',
      'signal-dark-yellow',
      'signal-green', // The green light that will blink
      'signal-dark-blue',
      'signal-dark-white',
    ]
  }

  return [
    'signal-dark-green',
    'signal-dark-yellow',
    'signal-dark-red',
    'signal-dark-blue',
    'signal-dark-white',
  ]
}
