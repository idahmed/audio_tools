/**
 * Registry for audio tools.
 * Add new tools here + a view file, then they appear in nav automatically.
 */
export const tools = [
  {
    path: '/convert',
    name: 'convert',
    label: 'Convert',
    heading: 'Convert audio',
    title: 'Free Audio Converter - MP3, WAV, OGG, WebM, M4A',
    description:
      'Convert audio files to MP3, WAV, OGG, WebM, or M4A for free. Browser-based conversion with no upload required. Fast, private, and works offline.',
    lede: 'Convert everyday audio formats in the browser without uploading tracks to a remote service.',
    points: ['Target MP3, WAV, and other browser-supported formats.', 'Preview before you download.', 'Conversion stays on your device.'],
    steps: ['Open an audio file.', 'Choose an output format.', 'Download the converted file.'],
    note: 'Support varies by browser codec availability.',
    shortcut: '1',
    faq: [
      { q: 'Is this audio converter free?', a: 'Yes. Free with no account and no conversion limits.' },
      { q: 'Are my files uploaded to a server?', a: 'No. Conversion runs locally in your browser.' },
      { q: 'What formats can I convert to?', a: 'MP3, WAV, and depending on browser support: WebM, OGG, and M4A.' },
    ],
  },
  {
    path: '/compress',
    name: 'compress',
    label: 'Compress',
    heading: 'Compress audio',
    title: 'Free Audio Compressor - Reduce MP3 File Size',
    description:
      'Compress audio files and reduce MP3 size with bitrate control or target file size. Free online tool, no upload needed.',
    lede: 'Reduce file size with bitrate or target-size controls while keeping the edit local.',
    points: ['Lower bitrate for smaller shares.', 'Listen to the preview for quality.', 'No server upload required.'],
    steps: ['Open a file.', 'Pick bitrate or target size.', 'Download the smaller file.'],
    note: 'Heavy compression can reduce clarity—preview first.',
    shortcut: '2',
    faq: [
      { q: 'How do I compress an MP3 online?', a: 'Open a file, choose bitrate or target size, then download the smaller file.' },
      { q: 'Does compression upload my audio?', a: 'No. Compression stays on your device in the browser.' },
    ],
  },
  {
    path: '/trim',
    name: 'trim',
    label: 'Trim',
    heading: 'Trim audio',
    title: 'Free Audio Trimmer - Cut MP3 and Audio Files',
    description:
      'Trim and cut audio files online for free. Select start and end points, optionally normalize volume. No upload required.',
    lede: 'Cut start and end points for a cleaner clip without leaving your machine.',
    points: ['Set precise start and end times.', 'Optional normalize helps even levels.', 'Trimmed audio stays local until you download.'],
    steps: ['Open a file.', 'Choose start and end.', 'Download the trimmed clip.'],
    note: 'Keep the source file if you may need a longer edit later.',
    shortcut: '3',
    faq: [
      { q: 'Can I cut part of an MP3 for free?', a: 'Yes. Set start and end times, then download the trimmed clip.' },
      { q: 'Is trimming private?', a: 'Yes. Files never leave your browser.' },
    ],
  },
  {
    path: '/volume',
    name: 'volume',
    label: 'Volume',
    heading: 'Change volume',
    title: 'Free Audio Volume Changer - Boost or Reduce Volume',
    description:
      'Adjust audio volume online for free. Boost quiet recordings or reduce loud audio. Normalize volume levels. No upload required.',
    lede: 'Raise quiet recordings or tame loud ones with local gain controls.',
    points: ['Boost or reduce volume.', 'Normalize when you want more even levels.', 'Processing does not upload your file.'],
    steps: ['Open audio.', 'Adjust volume or normalize.', 'Download the result.'],
    note: 'Avoid extreme boosts that clip and distort.',
    shortcut: '4',
    faq: [
      { q: 'Can I boost quiet audio online?', a: 'Yes. Raise gain or normalize, then download the louder file.' },
      { q: 'Does volume editing upload files?', a: 'No. Processing is local in your browser.' },
    ],
  },
  {
    path: '/merge',
    name: 'merge',
    label: 'Merge',
    heading: 'Merge audio',
    title: 'Free Audio Merger - Combine Multiple Audio Files',
    description:
      'Merge and join multiple audio files into one MP3 for free. Reorder clips before combining. No upload required.',
    lede: 'Join multiple clips into one downloadable file in your browser.',
    points: ['Add and reorder clips.', 'Merge into a single output.', 'Files stay on your device during the merge.'],
    steps: ['Add two or more files.', 'Reorder if needed.', 'Merge and download.'],
    note: 'Long merges need enough memory on older devices.',
    shortcut: '5',
    faq: [
      { q: 'Can I join multiple audio files?', a: 'Yes. Add clips, reorder them, then merge into one download.' },
      { q: 'Is merging private?', a: 'Yes. Files stay on your device.' },
    ],
  },
  {
    path: '/speed',
    name: 'speed',
    label: 'Speed',
    heading: 'Change speed',
    title: 'Free Audio Speed Changer - Slow Down or Speed Up',
    description:
      'Change audio playback speed online for free. Slow down or speed up audio files. Perfect for podcasts and learning. No upload required.',
    lede: 'Slow down or speed up speech and practice audio locally.',
    points: ['Useful for podcasts and language practice.', 'Preview the new pace.', 'No upload step.'],
    steps: ['Open a file.', 'Set a new speed.', 'Download the processed audio.'],
    note: 'Extreme speeds can sound unnatural—preview first.',
    shortcut: '6',
    faq: [
      { q: 'Can I slow down audio online?', a: 'Yes. Set a slower speed and download the processed file.' },
      { q: 'Does speed change upload my file?', a: 'No. It runs locally in your browser.' },
    ],
  },
  {
    path: '/fade',
    name: 'fade',
    label: 'Fade',
    heading: 'Fade audio',
    title: 'Free Audio Fade Tool - Add Fade In and Fade Out',
    description:
      'Add fade in and fade out effects to audio files for free. Create smooth transitions. No upload required.',
    lede: 'Add fade in and fade out for smoother starts and endings.',
    points: ['Shape the beginning and end of a clip.', 'Keep transitions gentle for listeners.', 'Edits remain local.'],
    steps: ['Open audio.', 'Set fade lengths.', 'Download the faded file.'],
    note: 'Pair with trim for a polished short clip.',
    shortcut: '7',
    faq: [
      { q: 'Can I add fade in and fade out online?', a: 'Yes. Set fade durations and download the result.' },
      { q: 'Are fade edits private?', a: 'Yes. Processing stays in your browser.' },
    ],
  },
  {
    path: '/reverse',
    name: 'reverse',
    label: 'Reverse',
    heading: 'Reverse audio',
    title: 'Free Audio Reverser - Play Audio Backwards',
    description:
      'Reverse audio files online for free. Play audio backwards instantly. No upload required — processing happens locally.',
    lede: 'Reverse a clip locally for effects or quick experiments.',
    points: ['Hear the reversed preview.', 'Download when ready.', 'No server round-trip.'],
    steps: ['Open audio.', 'Apply reverse.', 'Download the result.'],
    note: 'Reversing speech is usually for effects, not clarity.',
    shortcut: '8',
    faq: [
      { q: 'Can I reverse an audio file online?', a: 'Yes. Open a file, reverse it, and download the result.' },
      { q: 'Does reverse upload my audio?', a: 'No. It runs entirely in your browser.' },
    ],
  },
  {
    path: '/split',
    name: 'split',
    label: 'Split',
    heading: 'Split audio',
    title: 'Free Audio Splitter - Split Audio into Parts',
    description:
      'Split audio files into multiple parts for free. Cut audio at specific points. No upload required.',
    lede: 'Split a recording into parts you can download separately.',
    points: ['Choose split points carefully.', 'Export the segments you need.', 'Work stays in the browser.'],
    steps: ['Open a file.', 'Set split points.', 'Download the parts.'],
    note: 'Name downloads clearly so parts stay organized.',
    shortcut: '9',
    faq: [
      { q: 'Can I split one audio file into parts?', a: 'Yes. Set split points and download each part.' },
      { q: 'Is splitting private?', a: 'Yes. Files never leave your browser.' },
    ],
  },
  {
    path: '/channels',
    name: 'channels',
    label: 'Channels',
    heading: 'Edit channels',
    title: 'Free Audio Channel Editor - Mono, Stereo, Left, Right',
    description:
      'Edit audio channels online for free. Convert stereo to mono, extract left or right channel. No upload required.',
    lede: 'Inspect or adjust channels for mono/stereo troubleshooting.',
    points: ['Helpful when a side is missing.', 'Preview channel changes.', 'Local only.'],
    steps: ['Open audio.', 'Adjust channel options.', 'Download if needed.'],
    note: 'Use with the speaker hardware test if output still sounds wrong.',
    shortcut: '0',
    faq: [
      { q: 'Can I convert stereo to mono online?', a: 'Yes. Choose mono or extract a channel, then download.' },
      { q: 'Does channel editing upload files?', a: 'No. It stays local in your browser.' },
    ],
  },
  {
    path: '/loop',
    name: 'loop',
    label: 'Loop',
    heading: 'Loop audio',
    title: 'Free Audio Looper - Repeat Audio Sections',
    description:
      'Loop and repeat audio sections for free. Create seamless audio loops. No upload required.',
    lede: 'Create repeating loops for samples and practice beds in the browser.',
    points: ['Control how the clip repeats.', 'Preview before export.', 'Local processing only.'],
    steps: ['Open a file.', 'Configure loop settings.', 'Download the looped result.'],
    note: 'Watch output length so loops do not grow huge.',
    shortcut: 'l',
    faq: [
      { q: 'Can I loop a section of audio online?', a: 'Yes. Choose the range and repeat count, then download.' },
      { q: 'Is looping private?', a: 'Yes. Processing runs in your browser only.' },
    ],
  },
]

export function getTool(name) {
  return tools.find((tool) => tool.name === name)
}
