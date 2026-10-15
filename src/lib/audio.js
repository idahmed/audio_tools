import { Mp3Encoder } from 'lamejs'

let audioCtx

function ctx() {
  if (!audioCtx) audioCtx = new AudioContext()
  return audioCtx
}

export function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  )
  const value = bytes / 1024 ** index
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`
}

export function formatTime(seconds) {
  const safe = Math.max(0, seconds || 0)
  const m = Math.floor(safe / 60)
  const s = Math.floor(safe % 60)
  const ms = Math.floor((safe % 1) * 10)
  return `${m}:${String(s).padStart(2, '0')}.${ms}`
}

export async function loadAudio(file) {
  const url = URL.createObjectURL(file)
  try {
    const ac = ctx()
    if (ac.state === 'suspended') await ac.resume()
    const data = await file.arrayBuffer()
    const buffer = await ac.decodeAudioData(data.slice(0))
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      file,
      url,
      buffer,
      name: file.name.replace(/\.[^.]+$/, '') || 'audio',
      duration: buffer.duration,
      sampleRate: buffer.sampleRate,
      channels: buffer.numberOfChannels,
      size: file.size,
      type: file.type || 'audio/mpeg',
    }
  } catch (error) {
    URL.revokeObjectURL(url)
    throw error
  }
}

/** Peak envelope for a simple waveform (mono mix). */
export function peakEnvelope(buffer, bars = 120) {
  const channels = buffer.numberOfChannels
  const length = buffer.length
  const block = Math.max(1, Math.floor(length / bars))
  const peaks = new Float32Array(bars)
  for (let i = 0; i < bars; i += 1) {
    const start = i * block
    const end = Math.min(length, start + block)
    let max = 0
    for (let c = 0; c < channels; c += 1) {
      const data = buffer.getChannelData(c)
      for (let j = start; j < end; j += 1) {
        max = Math.max(max, Math.abs(data[j]))
      }
    }
    peaks[i] = max
  }
  return peaks
}

export function releaseAudio(source) {
  if (source?.url) URL.revokeObjectURL(source.url)
}

export function cloneBuffer(buffer) {
  const copy = ctx().createBuffer(
    buffer.numberOfChannels,
    buffer.length,
    buffer.sampleRate,
  )
  for (let c = 0; c < buffer.numberOfChannels; c += 1) {
    copy.copyToChannel(buffer.getChannelData(c).slice(0), c)
  }
  return copy
}

export function trimBuffer(buffer, startSec, endSec) {
  const start = Math.max(0, Math.floor(startSec * buffer.sampleRate))
  const end = Math.min(buffer.length, Math.floor(endSec * buffer.sampleRate))
  const length = Math.max(1, end - start)
  const out = ctx().createBuffer(
    buffer.numberOfChannels,
    length,
    buffer.sampleRate,
  )
  for (let c = 0; c < buffer.numberOfChannels; c += 1) {
    out.copyToChannel(buffer.getChannelData(c).subarray(start, end), c)
  }
  return out
}

export function normalizeBuffer(buffer, peak = 0.9) {
  let max = 0
  for (let c = 0; c < buffer.numberOfChannels; c += 1) {
    const data = buffer.getChannelData(c)
    for (let i = 0; i < data.length; i += 1) {
      max = Math.max(max, Math.abs(data[i]))
    }
  }
  const out = cloneBuffer(buffer)
  if (max < 1e-6) return out
  const gain = peak / max
  for (let c = 0; c < out.numberOfChannels; c += 1) {
    const data = out.getChannelData(c)
    for (let i = 0; i < data.length; i += 1) data[i] *= gain
  }
  return out
}

export function changeVolume(buffer, percent) {
  const out = cloneBuffer(buffer)
  const gain = percent / 100
  for (let c = 0; c < out.numberOfChannels; c += 1) {
    const data = out.getChannelData(c)
    for (let i = 0; i < data.length; i += 1) {
      data[i] = Math.max(-1, Math.min(1, data[i] * gain))
    }
  }
  return out
}

export function changeSpeed(buffer, rate) {
  const safe = Math.max(0.25, Math.min(4, rate || 1))
  const length = Math.max(1, Math.floor(buffer.length / safe))
  const out = ctx().createBuffer(
    buffer.numberOfChannels,
    length,
    buffer.sampleRate,
  )
  for (let c = 0; c < buffer.numberOfChannels; c += 1) {
    const input = buffer.getChannelData(c)
    const output = out.getChannelData(c)
    for (let i = 0; i < length; i += 1) {
      const src = i * safe
      const i0 = Math.floor(src)
      const i1 = Math.min(i0 + 1, input.length - 1)
      const t = src - i0
      output[i] = input[i0] * (1 - t) + input[i1] * t
    }
  }
  return out
}

function matchChannels(buffer, channels) {
  if (buffer.numberOfChannels === channels) return buffer
  const out = ctx().createBuffer(channels, buffer.length, buffer.sampleRate)
  for (let c = 0; c < channels; c += 1) {
    const src = buffer.getChannelData(Math.min(c, buffer.numberOfChannels - 1))
    out.copyToChannel(src.slice(0), c)
  }
  return out
}

function resampleBuffer(buffer, sampleRate) {
  if (buffer.sampleRate === sampleRate) return buffer
  const ratio = sampleRate / buffer.sampleRate
  const length = Math.max(1, Math.floor(buffer.length * ratio))
  const out = ctx().createBuffer(buffer.numberOfChannels, length, sampleRate)
  for (let c = 0; c < buffer.numberOfChannels; c += 1) {
    const input = buffer.getChannelData(c)
    const output = out.getChannelData(c)
    for (let i = 0; i < length; i += 1) {
      const src = i / ratio
      const i0 = Math.floor(src)
      const i1 = Math.min(i0 + 1, input.length - 1)
      const t = src - i0
      output[i] = input[i0] * (1 - t) + input[i1] * t
    }
  }
  return out
}

export function mergeBuffers(buffers) {
  if (!buffers.length) throw new Error('No audio to merge')
  const sampleRate = buffers[0].sampleRate
  const channels = Math.max(...buffers.map((item) => item.numberOfChannels))
  const parts = buffers.map((item) =>
    matchChannels(resampleBuffer(item, sampleRate), channels),
  )
  const length = parts.reduce((sum, item) => sum + item.length, 0)
  const out = ctx().createBuffer(channels, Math.max(1, length), sampleRate)
  let offset = 0
  for (const part of parts) {
    for (let c = 0; c < channels; c += 1) {
      out.getChannelData(c).set(part.getChannelData(c), offset)
    }
    offset += part.length
  }
  return out
}

const MEDIA_FORMATS = [
  {
    id: 'audio/webm',
    label: 'WebM',
    ext: 'webm',
    mimes: ['audio/webm;codecs=opus', 'audio/webm'],
  },
  {
    id: 'audio/ogg',
    label: 'OGG',
    ext: 'ogg',
    mimes: ['audio/ogg;codecs=opus', 'audio/ogg'],
  },
  {
    id: 'audio/mp4',
    label: 'M4A',
    ext: 'm4a',
    mimes: ['audio/mp4;codecs=mp4a.40.2', 'audio/mp4'],
  },
]

function pickMime(format) {
  if (typeof MediaRecorder === 'undefined') return ''
  return format.mimes.find((mime) => MediaRecorder.isTypeSupported(mime)) || ''
}

export function mediaFormats() {
  return MEDIA_FORMATS
    .filter((item) => pickMime(item))
    .map(({ id, label, ext }) => ({ id, label, ext }))
}

export async function encodeMedia(buffer, formatId) {
  const format = MEDIA_FORMATS.find((item) => item.id === formatId)
  const mime = format && pickMime(format)
  if (!mime) throw new Error('Format not supported in this browser')

  const ac = ctx()
  if (ac.state === 'suspended') await ac.resume()

  const dest = ac.createMediaStreamDestination()
  const source = ac.createBufferSource()
  source.buffer = buffer
  source.connect(dest)

  const recorder = new MediaRecorder(dest.stream, { mimeType: mime })
  const parts = []

  return new Promise((resolve, reject) => {
    recorder.ondataavailable = (event) => {
      if (event.data?.size) parts.push(event.data)
    }
    recorder.onerror = () => reject(new Error('Could not encode media'))
    recorder.onstop = () => resolve(new Blob(parts, { type: format.id }))
    source.onended = () => {
      if (recorder.state !== 'inactive') recorder.stop()
    }
    recorder.start()
    source.start()
  })
}

function interleave(buffer) {
  if (buffer.numberOfChannels === 1) return buffer.getChannelData(0)
  const left = buffer.getChannelData(0)
  const right = buffer.getChannelData(1)
  const mixed = new Float32Array(left.length + right.length)
  for (let i = 0, j = 0; i < left.length; i += 1) {
    mixed[j] = left[i]
    mixed[j + 1] = right[i]
    j += 2
  }
  return mixed
}

function floatTo16BitPCM(input) {
  const output = new Int16Array(input.length)
  for (let i = 0; i < input.length; i += 1) {
    const s = Math.max(-1, Math.min(1, input[i]))
    output[i] = s < 0 ? s * 0x8000 : s * 0x7fff
  }
  return output
}

export function encodeWav(buffer) {
  const channels = buffer.numberOfChannels
  const sampleRate = buffer.sampleRate
  const samples = interleave(buffer)
  const pcm = floatTo16BitPCM(samples)
  const bytesPerSample = 2
  const blockAlign = channels * bytesPerSample
  const dataSize = pcm.length * bytesPerSample
  const arrayBuffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(arrayBuffer)

  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeString(view, 8, 'WAVE')
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, channels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * blockAlign, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, 8 * bytesPerSample, true)
  writeString(view, 36, 'data')
  view.setUint32(40, dataSize, true)

  let offset = 44
  for (let i = 0; i < pcm.length; i += 1, offset += 2) {
    view.setInt16(offset, pcm[i], true)
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' })
}

function writeString(view, offset, text) {
  for (let i = 0; i < text.length; i += 1) {
    view.setUint8(offset + i, text.charCodeAt(i))
  }
}

const MP3_RATES = [8000, 11025, 12000, 16000, 22050, 24000, 32000, 44100, 48000]

function mp3SampleRate(rate) {
  return MP3_RATES.reduce((best, item) =>
    Math.abs(item - rate) < Math.abs(best - rate) ? item : best,
  )
}

export function encodeMp3(buffer, kbps = 128) {
  const sampleRate = mp3SampleRate(buffer.sampleRate)
  const source =
    sampleRate === buffer.sampleRate ? buffer : resampleBuffer(buffer, sampleRate)
  const channels = Math.min(2, source.numberOfChannels)
  const encoder = new Mp3Encoder(channels, sampleRate, kbps)
  const block = 1152
  const parts = []

  if (channels === 1) {
    const data = floatTo16BitPCM(source.getChannelData(0))
    for (let i = 0; i < data.length; i += block) {
      const chunk = data.subarray(i, i + block)
      const buf = encoder.encodeBuffer(chunk)
      if (buf.length) parts.push(buf)
    }
  } else {
    const left = floatTo16BitPCM(source.getChannelData(0))
    const right = floatTo16BitPCM(source.getChannelData(1))
    for (let i = 0; i < left.length; i += block) {
      const l = left.subarray(i, i + block)
      const r = right.subarray(i, i + block)
      const buf = encoder.encodeBuffer(l, r)
      if (buf.length) parts.push(buf)
    }
  }

  const end = encoder.flush()
  if (end.length) parts.push(end)
  return new Blob(parts, { type: 'audio/mpeg' })
}

export async function exportAudio(buffer, format, kbps = 128) {
  if (format === 'audio/wav') return encodeWav(buffer)
  if (format === 'audio/webm' || format === 'audio/ogg' || format === 'audio/mp4') {
    return encodeMedia(buffer, format)
  }
  return encodeMp3(buffer, kbps)
}

export async function exportToTarget(buffer, targetBytes) {
  const bitrates = [320, 256, 192, 160, 128, 96, 64, 48, 32]
  let best = null
  for (const kbps of bitrates) {
    const blob = encodeMp3(buffer, kbps)
    best = { blob, kbps }
    if (blob.size <= targetBytes) break
  }
  return best
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export const BASE_FORMATS = [
  { id: 'audio/mpeg', label: 'MP3', ext: 'mp3' },
  { id: 'audio/wav', label: 'WAV', ext: 'wav' },
]

export function availableFormats() {
  return [...BASE_FORMATS, ...mediaFormats()]
}

export function extFor(type) {
  return availableFormats().find((item) => item.id === type)?.ext || 'audio'
}

export const BITRATES = [320, 256, 192, 160, 128, 96, 64]
