/**
 * Registry for audio tools.
 * Add new tools here + a view file, then they appear in nav automatically.
 */
export const tools = [
  {
    path: '/convert',
    name: 'convert',
    label: 'Convert',
    title: 'Audio converter',
    shortcut: '1',
  },
  {
    path: '/compress',
    name: 'compress',
    label: 'Compress',
    title: 'Audio compressor',
    shortcut: '2',
  },
  {
    path: '/trim',
    name: 'trim',
    label: 'Trim',
    title: 'Audio trimmer',
    shortcut: '3',
  },
  {
    path: '/volume',
    name: 'volume',
    label: 'Volume',
    title: 'Audio volume',
    shortcut: '4',
  },
  {
    path: '/merge',
    name: 'merge',
    label: 'Merge',
    title: 'Audio merger',
    shortcut: '5',
  },
  {
    path: '/speed',
    name: 'speed',
    label: 'Speed',
    title: 'Audio speed',
    shortcut: '6',
  },
]
