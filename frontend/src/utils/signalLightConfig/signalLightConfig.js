// src/utils/signalLightConfig.js

export const MACHINE_STATUSES = {
  MACHINE_OFF: 'machine off',
  TROUBLE_MACHINE: 'trouble machine',
  CHOKOTEI: 'chokotei',
  DANDORI: 'dandori',
  STOP_PLANNING: 'stop planning',
  TOOL_CHANGES: 'tool changes',
  WAITING_MATERIAL: 'waiting material',
  CONTROL_LOSS_TIME: 'control loss time',
  UNKNOWN_LOSS_TIME: 'unknown loss time',
  NORMAL_OPERATION: 'normal operation',
  TENKEN: 'tenken',
  NOT_CONNECTED: 'not connected',
  JAM_ISTIRAHAT: 'jam istirahat',
  RENCANA_PERBAIKAN: 'rencana perbaikan',
  TRIAL: 'trial',
  PLAN_PROSES_SELESAI: 'plan proses selesai',
  FIVE_S: '5s',
  MEETING_PAGI_SORE: 'meeting pagi/sore',
  PEMANASAN: 'pemanasan',
  CEK_QC: 'cek qc',
  INPUT_DATA: 'input data',
  BUANG_KIRIKO: 'buang kiriko',
  MENUNGGU_INTRUKSI_ATASAN: 'menunggu intruksi atasan',
  REPAIR: 'repair',
  KAIZEN: 'kaizen',
  GANTI_TOISHI: 'ganti toishi',
  GANTI_DRESSER: 'ganti dresser',
  ONE_TOOTH: '1 tooth',
  CHECK_HAGATA: 'check hagata',
  DRESSING_PROFILE: 'dressing profile',
  DRESS_2: 'dress-2',
  ANTRI_JOB: 'antri job',
  // Backward compatibility
  MAINTENANCE: 'maintenance',
  QUALITY_CHECK: 'quality check',
  IDLE_TIME: 'idle time',
  PRODUCTION: 'production',
  SHUTDOWN: 'shutdown',
}

// Constants for border and header colors
export const COLORS = {
  DANGER: 'var(--cui-danger)',
  WARNING: 'var(--cui-warning)',
  INFO: 'var(--cui-info)',
  SECONDARY: 'var(--cui-secondary)',
  SUCCESS: 'var(--cui-success)',
  CUSTOM_PINK: '#fc38da',
  CUSTOM_PURPLE: '#c03fab',
  BLACK: '#000',
}

// Constants for signal patterns
export const SIGNAL_PATTERNS = {
  RED: 'signal-red',
  YELLOW: 'signal-yellow',
  GREEN: 'signal-green',
  BLUE: 'signal-blue',
  WHITE: 'signal-white',
  DARK_RED: 'signal-dark-red',
  DARK_YELLOW: 'signal-dark-yellow',
  DARK_GREEN: 'signal-dark-green',
  DARK_BLUE: 'signal-dark-blue',
  DARK_WHITE: 'signal-dark-white',
}

// Constants for animations
export const ANIMATIONS = {
  BLINKING: 'blinking',
  SLOW_BLINKING: 'slow-blinking',
  ALTERNATING: 'alternating',
}

// Helper function to create signal with animation
const createSignal = (baseSignal, animation = null) => {
  return animation ? `${baseSignal} ${animation}` : baseSignal
}

// Status configuration map
const STATUS_CONFIG_MAP = {
  [MACHINE_STATUSES.MACHINE_OFF]: {
    borderColor: COLORS.DANGER,
    headerColor: COLORS.DANGER,
    signal: [
      SIGNAL_PATTERNS.RED,
      SIGNAL_PATTERNS.DARK_YELLOW,
      SIGNAL_PATTERNS.DARK_GREEN,
      SIGNAL_PATTERNS.DARK_BLUE,
      SIGNAL_PATTERNS.DARK_WHITE,
    ],
    displayName: 'Machine Off',
  },
  [MACHINE_STATUSES.TROUBLE_MACHINE]: {
    borderColor: COLORS.DANGER,
    headerColor: COLORS.DANGER,
    signal: [
      createSignal(SIGNAL_PATTERNS.RED, ANIMATIONS.BLINKING),
      SIGNAL_PATTERNS.DARK_YELLOW,
      SIGNAL_PATTERNS.DARK_GREEN,
      SIGNAL_PATTERNS.DARK_BLUE,
      SIGNAL_PATTERNS.DARK_WHITE,
    ],
    displayName: 'Trouble Machine',
  },
  [MACHINE_STATUSES.CHOKOTEI]: {
    borderColor: COLORS.WARNING,
    headerColor: COLORS.WARNING,
    signal: [
      SIGNAL_PATTERNS.DARK_RED,
      SIGNAL_PATTERNS.YELLOW,
      SIGNAL_PATTERNS.DARK_GREEN,
      SIGNAL_PATTERNS.DARK_BLUE,
      SIGNAL_PATTERNS.DARK_WHITE,
    ],
    displayName: 'Chokotei',
  },
  [MACHINE_STATUSES.DANDORI]: {
    borderColor: COLORS.WARNING,
    headerColor: COLORS.WARNING,
    signal: [
      SIGNAL_PATTERNS.DARK_RED,
      createSignal(SIGNAL_PATTERNS.YELLOW, ANIMATIONS.BLINKING),
      SIGNAL_PATTERNS.DARK_GREEN,
      SIGNAL_PATTERNS.DARK_BLUE,
      SIGNAL_PATTERNS.DARK_WHITE,
    ],
    displayName: 'Dandori',
  },
  [MACHINE_STATUSES.STOP_PLANNING]: {
    borderColor: COLORS.INFO,
    headerColor: COLORS.INFO,
    signal: [
      SIGNAL_PATTERNS.DARK_RED,
      SIGNAL_PATTERNS.DARK_YELLOW,
      SIGNAL_PATTERNS.DARK_GREEN,
      SIGNAL_PATTERNS.BLUE,
      SIGNAL_PATTERNS.DARK_WHITE,
    ],
    displayName: 'Stop Planning',
  },
  [MACHINE_STATUSES.TOOL_CHANGES]: {
    borderColor: COLORS.INFO,
    headerColor: COLORS.INFO,
    signal: [
      SIGNAL_PATTERNS.DARK_RED,
      SIGNAL_PATTERNS.DARK_YELLOW,
      SIGNAL_PATTERNS.DARK_GREEN,
      createSignal(SIGNAL_PATTERNS.BLUE, ANIMATIONS.BLINKING),
      SIGNAL_PATTERNS.DARK_WHITE,
    ],
    displayName: 'Tool Changes',
  },
  [MACHINE_STATUSES.WAITING_MATERIAL]: {
    borderColor: COLORS.SECONDARY,
    headerColor: COLORS.SECONDARY,
    signal: [
      SIGNAL_PATTERNS.DARK_RED,
      SIGNAL_PATTERNS.DARK_YELLOW,
      SIGNAL_PATTERNS.DARK_GREEN,
      SIGNAL_PATTERNS.DARK_BLUE,
      createSignal(SIGNAL_PATTERNS.WHITE, ANIMATIONS.BLINKING),
    ],
    displayName: 'Waiting Material',
  },
  [MACHINE_STATUSES.CONTROL_LOSS_TIME]: {
    borderColor: COLORS.SECONDARY,
    headerColor: COLORS.SECONDARY,
    signal: [
      createSignal(SIGNAL_PATTERNS.RED, ANIMATIONS.ALTERNATING),
      SIGNAL_PATTERNS.DARK_YELLOW,
      SIGNAL_PATTERNS.DARK_GREEN,
      SIGNAL_PATTERNS.DARK_BLUE,
      createSignal(SIGNAL_PATTERNS.WHITE, ANIMATIONS.ALTERNATING),
    ],
    displayName: 'Control Loss Time',
  },
  [MACHINE_STATUSES.UNKNOWN_LOSS_TIME]: {
    borderColor: COLORS.SECONDARY,
    headerColor: COLORS.SECONDARY,
    signal: [
      SIGNAL_PATTERNS.DARK_RED,
      createSignal(SIGNAL_PATTERNS.YELLOW, ANIMATIONS.ALTERNATING),
      SIGNAL_PATTERNS.DARK_GREEN,
      SIGNAL_PATTERNS.DARK_BLUE,
      createSignal(SIGNAL_PATTERNS.WHITE, ANIMATIONS.ALTERNATING),
    ],
    displayName: 'Unknown Loss Time',
  },
  [MACHINE_STATUSES.NORMAL_OPERATION]: {
    borderColor: COLORS.SUCCESS,
    headerColor: COLORS.SUCCESS,
    signal: [
      SIGNAL_PATTERNS.DARK_RED,
      SIGNAL_PATTERNS.DARK_YELLOW,
      createSignal(SIGNAL_PATTERNS.GREEN, ANIMATIONS.BLINKING),
      SIGNAL_PATTERNS.DARK_BLUE,
      SIGNAL_PATTERNS.DARK_WHITE,
    ],
    displayName: 'Normal Operation',
  },
  [MACHINE_STATUSES.TENKEN]: {
    borderColor: COLORS.SUCCESS,
    headerColor: COLORS.SUCCESS,
    signal: [
      SIGNAL_PATTERNS.DARK_RED,
      SIGNAL_PATTERNS.DARK_YELLOW,
      createSignal(SIGNAL_PATTERNS.GREEN, ANIMATIONS.ALTERNATING),
      createSignal(SIGNAL_PATTERNS.BLUE, ANIMATIONS.ALTERNATING),
      SIGNAL_PATTERNS.DARK_WHITE,
    ],
    displayName: 'Tenken',
  },
  [MACHINE_STATUSES.NOT_CONNECTED]: {
    borderColor: COLORS.DANGER,
    headerColor: COLORS.DANGER,
    signal: [
      createSignal(SIGNAL_PATTERNS.RED, ANIMATIONS.ALTERNATING),
      SIGNAL_PATTERNS.DARK_YELLOW,
      SIGNAL_PATTERNS.DARK_GREEN,
      createSignal(SIGNAL_PATTERNS.BLUE, ANIMATIONS.ALTERNATING),
      SIGNAL_PATTERNS.DARK_WHITE,
    ],
    displayName: 'Not Connected',
  },
  [MACHINE_STATUSES.JAM_ISTIRAHAT]: {
    borderColor: COLORS.SECONDARY,
    headerColor: COLORS.SECONDARY,
    signal: [
      SIGNAL_PATTERNS.DARK_RED,
      SIGNAL_PATTERNS.DARK_YELLOW,
      SIGNAL_PATTERNS.DARK_GREEN,
      SIGNAL_PATTERNS.DARK_BLUE,
      SIGNAL_PATTERNS.WHITE,
    ],
    displayName: 'Jam Istirahat',
  },
  [MACHINE_STATUSES.RENCANA_PERBAIKAN]: {
    borderColor: COLORS.SECONDARY,
    headerColor: COLORS.SECONDARY,
    signal: [
      SIGNAL_PATTERNS.DARK_RED,
      SIGNAL_PATTERNS.DARK_YELLOW,
      createSignal(SIGNAL_PATTERNS.GREEN, ANIMATIONS.ALTERNATING),
      SIGNAL_PATTERNS.DARK_BLUE,
      createSignal(SIGNAL_PATTERNS.WHITE, ANIMATIONS.ALTERNATING),
    ],
    displayName: 'Rencana Perbaikan',
  },
  [MACHINE_STATUSES.TRIAL]: {
    borderColor: COLORS.WARNING,
    headerColor: COLORS.WARNING,
    signal: [
      SIGNAL_PATTERNS.DARK_RED,
      createSignal(SIGNAL_PATTERNS.YELLOW, ANIMATIONS.ALTERNATING),
      createSignal(SIGNAL_PATTERNS.GREEN, ANIMATIONS.ALTERNATING),
      SIGNAL_PATTERNS.DARK_BLUE,
      SIGNAL_PATTERNS.DARK_WHITE,
    ],
    displayName: 'Trial',
  },
  [MACHINE_STATUSES.PLAN_PROSES_SELESAI]: {
    borderColor: COLORS.SUCCESS,
    headerColor: COLORS.SUCCESS,
    signal: [
      SIGNAL_PATTERNS.DARK_RED,
      SIGNAL_PATTERNS.DARK_YELLOW,
      SIGNAL_PATTERNS.GREEN,
      SIGNAL_PATTERNS.DARK_BLUE,
      SIGNAL_PATTERNS.DARK_WHITE,
    ],
    displayName: 'Plan Proses Selesai',
  },
  [MACHINE_STATUSES.FIVE_S]: {
    borderColor: COLORS.INFO,
    headerColor: COLORS.INFO,
    signal: [
      SIGNAL_PATTERNS.DARK_RED,
      createSignal(SIGNAL_PATTERNS.YELLOW, ANIMATIONS.ALTERNATING),
      SIGNAL_PATTERNS.DARK_GREEN,
      createSignal(SIGNAL_PATTERNS.BLUE, ANIMATIONS.ALTERNATING),
      SIGNAL_PATTERNS.DARK_WHITE,
    ],
    displayName: '5S',
  },
  [MACHINE_STATUSES.MEETING_PAGI_SORE]: {
    borderColor: COLORS.INFO,
    headerColor: COLORS.INFO,
    signal: [
      SIGNAL_PATTERNS.DARK_RED,
      SIGNAL_PATTERNS.DARK_YELLOW,
      SIGNAL_PATTERNS.DARK_GREEN,
      createSignal(SIGNAL_PATTERNS.BLUE, ANIMATIONS.ALTERNATING),
      createSignal(SIGNAL_PATTERNS.WHITE, ANIMATIONS.ALTERNATING),
    ],
    displayName: 'Meeting Pagi/Sore',
  },
  [MACHINE_STATUSES.PEMANASAN]: {
    borderColor: COLORS.WARNING,
    headerColor: COLORS.WARNING,
    signal: [
      createSignal(SIGNAL_PATTERNS.RED, ANIMATIONS.ALTERNATING),
      createSignal(SIGNAL_PATTERNS.YELLOW, ANIMATIONS.ALTERNATING),
      SIGNAL_PATTERNS.DARK_GREEN,
      SIGNAL_PATTERNS.DARK_BLUE,
      SIGNAL_PATTERNS.DARK_WHITE,
    ],
    displayName: 'Pemanasan',
  },
  [MACHINE_STATUSES.CEK_QC]: {
    borderColor: COLORS.INFO,
    headerColor: COLORS.INFO,
    signal: [
      createSignal(SIGNAL_PATTERNS.RED, ANIMATIONS.ALTERNATING),
      SIGNAL_PATTERNS.DARK_YELLOW,
      SIGNAL_PATTERNS.DARK_GREEN,
      createSignal(SIGNAL_PATTERNS.BLUE, ANIMATIONS.ALTERNATING),
      SIGNAL_PATTERNS.DARK_WHITE,
    ],
    displayName: 'Cek QC',
  },
  [MACHINE_STATUSES.INPUT_DATA]: {
    borderColor: COLORS.INFO,
    headerColor: COLORS.INFO,
    signal: [
      SIGNAL_PATTERNS.DARK_RED,
      SIGNAL_PATTERNS.DARK_YELLOW,
      createSignal(SIGNAL_PATTERNS.GREEN, ANIMATIONS.ALTERNATING),
      createSignal(SIGNAL_PATTERNS.BLUE, ANIMATIONS.ALTERNATING),
      SIGNAL_PATTERNS.DARK_WHITE,
    ],
    displayName: 'Input Data',
  },
  [MACHINE_STATUSES.BUANG_KIRIKO]: {
    borderColor: COLORS.DANGER,
    headerColor: COLORS.DANGER,
    signal: [
      createSignal(SIGNAL_PATTERNS.RED, ANIMATIONS.ALTERNATING),
      createSignal(SIGNAL_PATTERNS.YELLOW, ANIMATIONS.ALTERNATING),
      createSignal(SIGNAL_PATTERNS.GREEN, ANIMATIONS.ALTERNATING),
      SIGNAL_PATTERNS.DARK_BLUE,
      SIGNAL_PATTERNS.DARK_WHITE,
    ],
    displayName: 'Buang Kiriko',
  },
  [MACHINE_STATUSES.MENUNGGU_INTRUKSI_ATASAN]: {
    borderColor: COLORS.SECONDARY,
    headerColor: COLORS.SECONDARY,
    signal: [
      SIGNAL_PATTERNS.DARK_RED,
      SIGNAL_PATTERNS.DARK_YELLOW,
      SIGNAL_PATTERNS.DARK_GREEN,
      SIGNAL_PATTERNS.DARK_BLUE,
      createSignal(SIGNAL_PATTERNS.WHITE, ANIMATIONS.SLOW_BLINKING),
    ],
    displayName: 'Menunggu Intruksi Atasan',
  },
  [MACHINE_STATUSES.REPAIR]: {
    borderColor: COLORS.DANGER,
    headerColor: COLORS.DANGER,
    signal: [
      createSignal(SIGNAL_PATTERNS.RED, ANIMATIONS.SLOW_BLINKING),
      SIGNAL_PATTERNS.DARK_YELLOW,
      SIGNAL_PATTERNS.DARK_GREEN,
      SIGNAL_PATTERNS.DARK_BLUE,
      SIGNAL_PATTERNS.DARK_WHITE,
    ],
    displayName: 'Repair',
  },
  [MACHINE_STATUSES.KAIZEN]: {
    borderColor: COLORS.SUCCESS,
    headerColor: COLORS.SUCCESS,
    signal: [
      SIGNAL_PATTERNS.DARK_RED,
      SIGNAL_PATTERNS.DARK_YELLOW,
      createSignal(SIGNAL_PATTERNS.GREEN, ANIMATIONS.ALTERNATING),
      createSignal(SIGNAL_PATTERNS.BLUE, ANIMATIONS.ALTERNATING),
      createSignal(SIGNAL_PATTERNS.WHITE, ANIMATIONS.ALTERNATING),
    ],
    displayName: 'Kaizen',
  },
  [MACHINE_STATUSES.GANTI_TOISHI]: {
    borderColor: COLORS.WARNING,
    headerColor: COLORS.WARNING,
    signal: [
      SIGNAL_PATTERNS.DARK_RED,
      createSignal(SIGNAL_PATTERNS.YELLOW, ANIMATIONS.SLOW_BLINKING),
      SIGNAL_PATTERNS.DARK_GREEN,
      SIGNAL_PATTERNS.DARK_BLUE,
      SIGNAL_PATTERNS.DARK_WHITE,
    ],
    displayName: 'Ganti Toishi',
  },
  [MACHINE_STATUSES.GANTI_DRESSER]: {
    borderColor: COLORS.INFO,
    headerColor: COLORS.INFO,
    signal: [
      SIGNAL_PATTERNS.DARK_RED,
      SIGNAL_PATTERNS.DARK_YELLOW,
      SIGNAL_PATTERNS.DARK_GREEN,
      createSignal(SIGNAL_PATTERNS.BLUE, ANIMATIONS.SLOW_BLINKING),
      SIGNAL_PATTERNS.DARK_WHITE,
    ],
    displayName: 'Ganti Dresser',
  },
  [MACHINE_STATUSES.ONE_TOOTH]: {
    borderColor: COLORS.SUCCESS,
    headerColor: COLORS.SUCCESS,
    signal: [
      SIGNAL_PATTERNS.DARK_RED,
      createSignal(SIGNAL_PATTERNS.YELLOW, ANIMATIONS.ALTERNATING),
      createSignal(SIGNAL_PATTERNS.GREEN, ANIMATIONS.ALTERNATING),
      SIGNAL_PATTERNS.DARK_BLUE,
      SIGNAL_PATTERNS.DARK_WHITE,
    ],
    displayName: '1 Tooth',
  },
  [MACHINE_STATUSES.CHECK_HAGATA]: {
    borderColor: COLORS.SUCCESS,
    headerColor: COLORS.SUCCESS,
    signal: [
      createSignal(SIGNAL_PATTERNS.RED, ANIMATIONS.ALTERNATING),
      SIGNAL_PATTERNS.DARK_YELLOW,
      createSignal(SIGNAL_PATTERNS.GREEN, ANIMATIONS.ALTERNATING),
      SIGNAL_PATTERNS.DARK_BLUE,
      SIGNAL_PATTERNS.DARK_WHITE,
    ],
    displayName: 'Check Hagata',
  },
  [MACHINE_STATUSES.DRESSING_PROFILE]: {
    borderColor: COLORS.WARNING,
    headerColor: COLORS.WARNING,
    signal: [
      SIGNAL_PATTERNS.DARK_RED,
      createSignal(SIGNAL_PATTERNS.YELLOW, ANIMATIONS.ALTERNATING),
      SIGNAL_PATTERNS.DARK_GREEN,
      createSignal(SIGNAL_PATTERNS.BLUE, ANIMATIONS.ALTERNATING),
      SIGNAL_PATTERNS.DARK_WHITE,
    ],
    displayName: 'Dressing Profile',
  },
  [MACHINE_STATUSES.DRESS_2]: {
    borderColor: COLORS.WARNING,
    headerColor: COLORS.WARNING,
    signal: [
      SIGNAL_PATTERNS.DARK_RED,
      createSignal(SIGNAL_PATTERNS.YELLOW, ANIMATIONS.ALTERNATING),
      SIGNAL_PATTERNS.DARK_GREEN,
      SIGNAL_PATTERNS.DARK_BLUE,
      createSignal(SIGNAL_PATTERNS.WHITE, ANIMATIONS.ALTERNATING),
    ],
    displayName: 'Dress-2',
  },
  [MACHINE_STATUSES.ANTRI_JOB]: {
    borderColor: COLORS.SECONDARY,
    headerColor: COLORS.SECONDARY,
    signal: [
      SIGNAL_PATTERNS.DARK_RED,
      SIGNAL_PATTERNS.DARK_YELLOW,
      createSignal(SIGNAL_PATTERNS.GREEN, ANIMATIONS.ALTERNATING),
      createSignal(SIGNAL_PATTERNS.BLUE, ANIMATIONS.ALTERNATING),
      createSignal(SIGNAL_PATTERNS.WHITE, ANIMATIONS.ALTERNATING),
    ],
    displayName: 'Antri Job',
  },
  // Backward compatibility
  [MACHINE_STATUSES.MAINTENANCE]: {
    borderColor: COLORS.CUSTOM_PINK,
    headerColor: COLORS.CUSTOM_PINK,
    signal: [
      SIGNAL_PATTERNS.DARK_RED,
      SIGNAL_PATTERNS.DARK_YELLOW,
      SIGNAL_PATTERNS.DARK_GREEN,
      SIGNAL_PATTERNS.BLUE,
      SIGNAL_PATTERNS.DARK_WHITE,
    ],
    displayName: 'Maintenance',
  },
  [MACHINE_STATUSES.QUALITY_CHECK]: {
    borderColor: COLORS.WARNING,
    headerColor: COLORS.WARNING,
    signal: [
      SIGNAL_PATTERNS.DARK_RED,
      SIGNAL_PATTERNS.YELLOW,
      SIGNAL_PATTERNS.DARK_GREEN,
      SIGNAL_PATTERNS.DARK_BLUE,
      SIGNAL_PATTERNS.DARK_WHITE,
    ],
    displayName: 'Quality Check',
  },
  [MACHINE_STATUSES.IDLE_TIME]: {
    borderColor: COLORS.CUSTOM_PURPLE,
    headerColor: COLORS.CUSTOM_PURPLE,
    signal: [
      SIGNAL_PATTERNS.DARK_GREEN,
      SIGNAL_PATTERNS.DARK_YELLOW,
      SIGNAL_PATTERNS.DARK_RED,
      SIGNAL_PATTERNS.BLUE,
      SIGNAL_PATTERNS.DARK_WHITE,
    ],
    displayName: 'Idle Time',
  },
  [MACHINE_STATUSES.PRODUCTION]: {
    borderColor: COLORS.SUCCESS,
    headerColor: COLORS.SUCCESS,
    signal: [
      SIGNAL_PATTERNS.DARK_RED,
      SIGNAL_PATTERNS.DARK_YELLOW,
      SIGNAL_PATTERNS.GREEN,
      SIGNAL_PATTERNS.DARK_BLUE,
      SIGNAL_PATTERNS.DARK_WHITE,
    ],
    displayName: 'Production',
  },
  [MACHINE_STATUSES.SHUTDOWN]: {
    borderColor: COLORS.SECONDARY,
    headerColor: COLORS.SECONDARY,
    signal: [
      SIGNAL_PATTERNS.DARK_GREEN,
      SIGNAL_PATTERNS.DARK_YELLOW,
      SIGNAL_PATTERNS.DARK_RED,
      SIGNAL_PATTERNS.DARK_BLUE,
      SIGNAL_PATTERNS.WHITE,
    ],
    displayName: 'Shutdown',
  },
}

// Default signal configuration
const DEFAULT_CONFIG = {
  borderColor: COLORS.BLACK,
  headerColor: COLORS.BLACK,
  signal: [
    SIGNAL_PATTERNS.DARK_RED,
    SIGNAL_PATTERNS.DARK_YELLOW,
    SIGNAL_PATTERNS.DARK_GREEN,
    SIGNAL_PATTERNS.DARK_BLUE,
    SIGNAL_PATTERNS.DARK_WHITE,
  ],
  displayName: 'Unknown',
}

// Get status configuration based on status string
export const getStatusConfig = (status) => {
  // Convert status to lowercase for case-insensitive matching
  const normalizedStatus = status.toLowerCase()

  // Return matching config or default config
  return STATUS_CONFIG_MAP[normalizedStatus] || { ...DEFAULT_CONFIG, displayName: status }
}

// Generate default signal array for machines without status
export const generateDefaultSignal = (status) => {
  const config = getStatusConfig(status)
  // Return the signal array from the status configuration
  return config.signal
}

// Add CSS classes for the signal states
export const addSignalStylesheet = () => {
  // Only add stylesheet if it doesn't already exist
  if (typeof document !== 'undefined' && !document.getElementById('signal-light-styles')) {
    const stylesheet = document.createElement('style')
    stylesheet.id = 'signal-light-styles'
    stylesheet.innerHTML = `
      /* Blinking animation */
      @keyframes blink {
        0%, 49% { opacity: 1; }
        50%, 100% { opacity: 0.3; }
      }
      
      /* Slow blinking animation */
      @keyframes slow-blink {
        0%, 74% { opacity: 1; }
        75%, 100% { opacity: 0.3; }
      }
      
      /* Alternating animation */
      @keyframes alternate {
        0%, 49% { opacity: 1; }
        50%, 100% { opacity: 0.3; }
      }
      
      /* Apply animations to elements */
      .${ANIMATIONS.BLINKING} {
        animation: blink 1s infinite;
      }
      
      .${ANIMATIONS.SLOW_BLINKING} {
        animation: slow-blink 2s infinite;
      }
      
      .${ANIMATIONS.ALTERNATING} {
        animation: alternate 1.5s infinite;
      }
    `
    document.head.appendChild(stylesheet)
  }
}

// Initialize CSS when module is imported
if (typeof document !== 'undefined') {
  addSignalStylesheet()
}
