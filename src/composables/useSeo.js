const BASE_URL = 'https://tools.sessea.com'
const SITE_NAME = 'sessea Audio Tools'

export function useSeo() {
  function updateMeta(name, content, property = false) {
    const attr = property ? 'property' : 'name'
    let meta = document.querySelector(`meta[${attr}="${name}"]`)
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute(attr, name)
      document.head.appendChild(meta)
    }
    meta.content = content
  }

  function updateCanonical(path) {
    let link = document.querySelector('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'canonical'
      document.head.appendChild(link)
    }
    link.href = `${BASE_URL}${path}`
  }

  function setPageSeo({ title, description, path }) {
    const fullTitle = `${title} | ${SITE_NAME}`
    
    document.title = fullTitle
    updateMeta('title', fullTitle)
    updateMeta('description', description)
    
    updateMeta('og:title', title, true)
    updateMeta('og:description', description, true)
    updateMeta('og:url', `${BASE_URL}${path}`, true)
    
    updateMeta('twitter:title', title)
    updateMeta('twitter:description', description)
    updateMeta('twitter:url', `${BASE_URL}${path}`)
    
    updateCanonical(path)
  }

  return { setPageSeo }
}

export const seoData = {
  convert: {
    title: 'Free Audio Converter - MP3, WAV, OGG, WebM, M4A',
    description: 'Convert audio files to MP3, WAV, OGG, WebM, or M4A for free. Browser-based conversion with no upload required. Fast, private, and works offline.',
  },
  compress: {
    title: 'Free Audio Compressor - Reduce MP3 File Size',
    description: 'Compress audio files and reduce MP3 size with bitrate control or target file size. Free online tool, no upload needed. Perfect for email attachments.',
  },
  trim: {
    title: 'Free Audio Trimmer - Cut MP3 and Audio Files',
    description: 'Trim and cut audio files online for free. Select start and end points, optionally normalize volume. No upload required - edit directly in your browser.',
  },
  volume: {
    title: 'Free Audio Volume Changer - Boost or Reduce Volume',
    description: 'Adjust audio volume online for free. Boost quiet recordings or reduce loud audio. Normalize volume levels. No upload required.',
  },
  merge: {
    title: 'Free Audio Merger - Combine Multiple Audio Files',
    description: 'Merge and join multiple audio files into one MP3 for free. Reorder clips before combining. No upload required - works entirely in your browser.',
  },
  speed: {
    title: 'Free Audio Speed Changer - Slow Down or Speed Up',
    description: 'Change audio playback speed online for free. Slow down or speed up audio files. Perfect for podcasts and learning. No upload required.',
  },
  fade: {
    title: 'Free Audio Fade Tool - Add Fade In and Fade Out',
    description: 'Add fade in and fade out effects to audio files for free. Create smooth transitions. No upload required - edit directly in your browser.',
  },
  reverse: {
    title: 'Free Audio Reverser - Play Audio Backwards',
    description: 'Reverse audio files online for free. Play audio backwards instantly. No upload required - processing happens locally in your browser.',
  },
  split: {
    title: 'Free Audio Splitter - Split Audio into Parts',
    description: 'Split audio files into multiple parts for free. Cut audio at specific points. No upload required - works entirely in your browser.',
  },
  channels: {
    title: 'Free Audio Channel Editor - Mono, Stereo, Left, Right',
    description: 'Edit audio channels online for free. Convert stereo to mono, extract left or right channel. No upload required - private browser processing.',
  },
  loop: {
    title: 'Free Audio Looper - Repeat Audio Sections',
    description: 'Loop and repeat audio sections for free. Create seamless audio loops. No upload required - works directly in your browser.',
  },
  help: {
    title: 'How to Use - Audio Tools Guide',
    description: 'Learn how to use sessea audio tools. Quick guide with keyboard shortcuts, supported formats, and batch processing instructions.',
  },
  terms: {
    title: 'Terms of Service',
    description: 'Terms of service for sessea audio tools. Read about service usage, intellectual property, and third-party advertising.',
  },
  privacy: {
    title: 'Privacy Policy - No Data Collection',
    description: 'Privacy policy for sessea audio tools. We do not collect user data. All audio processing happens locally in your browser.',
  },
}
