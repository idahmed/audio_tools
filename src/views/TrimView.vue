<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import AudioPlayer from '@/components/AudioPlayer.vue'
import CrossToolLinks from '@/components/CrossToolLinks.vue'
import DropZone from '@/components/DropZone.vue'
import QueueBar from '@/components/QueueBar.vue'
import ResultBar from '@/components/ResultBar.vue'
import SeoBlurb from '@/components/SeoBlurb.vue'
import Waveform from '@/components/Waveform.vue'
import { useAudioSource } from '@/composables/useAudioSource'
import {
  downloadBlob,
  encodeMp3,
  formatBytes,
  formatTime,
  normalizeBuffer,
  trimBuffer,
} from '@/lib/audio'

const {
  items,
  current,
  source,
  error,
  addFiles,
  setDraft,
  clearDraft,
  select,
  removeCurrent,
  clear,
} = useAudioSource()

const start = ref(0)
const end = ref(0)
const normalize = ref(true)
const exporting = ref(false)
const status = ref('')
const resultUrl = ref('')
const resultSize = ref(0)
const resultDuration = ref(0)

let alive = true
let timer

const originalMeta = computed(() => {
  if (!source.value) return ''
  return `${formatTime(source.value.duration)} · ${formatBytes(source.value.size)}`
})

const resultMeta = computed(() => {
  if (!resultUrl.value) return ''
  return `${formatTime(resultDuration.value)} · ${formatBytes(resultSize.value)}`
})

const canExport = computed(() => !!source.value && end.value > start.value)

const seoPoints = [
  'Cut the part of a track you need and export it as MP3.',
  'Optional normalize makes quiet recordings louder and even.',
  'Ideal for podcasts, voice notes, and short clips.',
]

watch(source, (value) => {
  if (!value) {
    revokeResult()
    return
  }
  start.value = 0
  end.value = Number(value.duration.toFixed(2))
})

watch([source, start, end, normalize], () => {
  clearTimeout(timer)
  if (!source.value) return
  if (start.value > end.value) {
    const swap = start.value
    start.value = end.value
    end.value = swap
    return
  }
  timer = setTimeout(updatePreview, 220)
})

onUnmounted(() => {
  alive = false
  clearTimeout(timer)
  revokeResult()
})

function revokeResult() {
  if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
  resultUrl.value = ''
  resultSize.value = 0
  resultDuration.value = 0
  clearDraft()
}

function buildBuffer() {
  let buffer = trimBuffer(source.value.buffer, start.value, end.value)
  if (normalize.value) buffer = normalizeBuffer(buffer)
  return buffer
}

async function updatePreview() {
  if (!source.value || end.value <= start.value) {
    status.value = end.value <= start.value ? 'End must be after start.' : ''
    return
  }
  status.value = 'Working…'
  try {
    const buffer = buildBuffer()
    const blob = encodeMp3(buffer, 192)
    if (!alive) return
    if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
    resultUrl.value = URL.createObjectURL(blob)
    resultSize.value = blob.size
    resultDuration.value = buffer.duration
    setDraft(buffer, source.value.name)
    status.value = ''
  } catch {
    if (!alive) return
    revokeResult()
    status.value = 'Could not trim audio.'
  }
}

async function download() {
  if (!canExport.value) return
  exporting.value = true
  try {
    const buffer = buildBuffer()
    const blob = encodeMp3(buffer, 192)
    downloadBlob(blob, `${source.value.name}-trim.mp3`)
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <section class="tool">
    <header class="tool-head">
      <h2>Trim</h2>
      <p>Cut a section and optionally normalize volume.</p>
    </header>

    <DropZone v-if="!source" @files="addFiles" />

    <div v-else class="workspace">
      <QueueBar
        :items="items"
        :current="current"
        @select="select"
        @remove="removeCurrent"
      />

      <Waveform :buffer="source.buffer" :start="start" :end="end" />

      <div class="players">
        <AudioPlayer label="Original" :url="source.url" :meta="originalMeta" />
        <AudioPlayer label="Trimmed" :url="resultUrl" :meta="resultMeta" />
      </div>

      <div class="controls">
        <div class="row">
          <label class="field">
            <span>Start · {{ formatTime(start) }}</span>
            <input
              v-model.number="start"
              type="range"
              min="0"
              :max="source.duration"
              step="0.1"
            >
          </label>
          <label class="field">
            <span>End · {{ formatTime(end) }}</span>
            <input
              v-model.number="end"
              type="range"
              min="0"
              :max="source.duration"
              step="0.1"
            >
          </label>
        </div>

        <label class="check">
          <input v-model="normalize" type="checkbox">
          <span>Normalize volume</span>
        </label>

        <ResultBar
          :busy="exporting"
          :ready="canExport"
          @download="download"
          @clear="clear"
        />
        <CrossToolLinks />
        <p v-if="status" class="status">{{ status }}</p>
      </div>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
    <SeoBlurb title="Trim audio online" :points="seoPoints" />
  </section>
</template>
