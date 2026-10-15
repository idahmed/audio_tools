<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import AudioPlayer from '@/components/AudioPlayer.vue'
import CrossToolLinks from '@/components/CrossToolLinks.vue'
import DropZone from '@/components/DropZone.vue'
import QueueBar from '@/components/QueueBar.vue'
import ResultBar from '@/components/ResultBar.vue'
import SeoBlurb from '@/components/SeoBlurb.vue'
import { useAudioSource } from '@/composables/useAudioSource'
import {
  availableFormats,
  downloadBlob,
  exportAudio,
  extFor,
  formatBytes,
  formatTime,
} from '@/lib/audio'
import { downloadZip } from '@/lib/batch'
import { loadPrefs, savePrefs } from '@/lib/prefs'

const formats = availableFormats()
const prefs = loadPrefs()

const {
  items,
  current,
  source,
  error,
  addFiles,
  replaceFile,
  select,
  removeCurrent,
  clear,
} = useAudioSource()

const format = ref(
  formats.some((item) => item.id === prefs.format) ? prefs.format : 'audio/mpeg',
)
const bitrate = ref(prefs.bitrate || 128)
const exporting = ref(false)
const status = ref('')
const resultUrl = ref('')
const resultSize = ref(0)

const originalMeta = computed(() => {
  if (!source.value) return ''
  return `${formatTime(source.value.duration)} · ${formatBytes(source.value.size)} · ${source.value.sampleRate} Hz`
})

const resultMeta = computed(() => {
  if (!resultUrl.value) return ''
  return formatBytes(resultSize.value)
})

const showBitrate = computed(() => format.value === 'audio/mpeg')
const livePreview = computed(
  () => format.value === 'audio/mpeg' || format.value === 'audio/wav',
)
const count = computed(() => items.value.length)

const seoPoints = [
  'Convert audio to MP3, WAV, WebM, OGG, or M4A in your browser.',
  'No upload required — files stay on your device.',
  'WebM/OGG/M4A appear when your browser supports MediaRecorder for them.',
]

let timer

watch([format, bitrate], ([nextFormat, nextBitrate]) => {
  savePrefs({ format: nextFormat, bitrate: nextBitrate })
})

watch([source, format, bitrate], () => {
  clearTimeout(timer)
  if (!source.value) {
    revokeResult()
    status.value = ''
    return
  }
  if (!livePreview.value) {
    revokeResult()
    status.value = 'WebM / OGG / M4A export on download (runs in real time).'
    return
  }
  timer = setTimeout(updatePreview, 200)
})

onUnmounted(() => {
  clearTimeout(timer)
  revokeResult()
})

function revokeResult() {
  if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
  resultUrl.value = ''
  resultSize.value = 0
}

async function updatePreview() {
  if (!source.value || !livePreview.value) return
  status.value = 'Working…'
  try {
    const blob = await exportAudio(source.value.buffer, format.value, bitrate.value)
    if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
    resultUrl.value = URL.createObjectURL(blob)
    resultSize.value = blob.size
    status.value = ''
  } catch {
    status.value = 'Could not convert audio.'
  }
}

async function download() {
  if (!source.value) return
  exporting.value = true
  status.value = livePreview.value ? '' : 'Encoding… keep this tab open.'
  try {
    const blob = await exportAudio(source.value.buffer, format.value, bitrate.value)
    downloadBlob(blob, `${source.value.name}.${extFor(format.value)}`)
    status.value = livePreview.value
      ? ''
      : 'WebM / OGG / M4A export on download (runs in real time).'
  } catch {
    status.value = 'Could not convert audio.'
  } finally {
    exporting.value = false
  }
}

async function downloadAll() {
  if (!items.value.length) return
  if (!livePreview.value) {
    status.value = 'Batch ZIP works with MP3 or WAV.'
    return
  }
  exporting.value = true
  status.value = 'Preparing zip…'
  try {
    const files = []
    for (const item of items.value) {
      const blob = await exportAudio(item.buffer, format.value, bitrate.value)
      files.push({ name: `${item.name}.${extFor(format.value)}`, blob })
    }
    await downloadZip(files, 'converted-audio.zip')
    status.value = `Zip ready · ${files.length} files`
  } catch {
    status.value = 'Could not create zip.'
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <section class="tool">
    <header class="tool-head">
      <h2>Convert</h2>
      <p>Change audio format in your browser. Nothing is uploaded.</p>
    </header>

    <DropZone v-if="!source" @files="addFiles" />

    <div v-else class="workspace">
      <QueueBar
        :items="items"
        :current="current"
        @select="select"
        @remove="removeCurrent"
      />

      <div class="players">
        <AudioPlayer label="Original" :url="source.url" :meta="originalMeta" />
        <AudioPlayer label="Result" :url="resultUrl" :meta="resultMeta" />
      </div>

      <div class="controls">
        <label class="field">
          <span>Format</span>
          <select v-model="format">
            <option v-for="item in formats" :key="item.id" :value="item.id">
              {{ item.label }}
            </option>
          </select>
        </label>

        <label v-if="showBitrate" class="field">
          <span>MP3 bitrate · {{ bitrate }} kbps</span>
          <input v-model.number="bitrate" type="range" min="64" max="320" step="32">
        </label>

        <ResultBar
          :busy="exporting"
          :ready="!!source"
          @download="download"
          @replace="replaceFile"
          @clear="clear"
        />

        <button
          v-if="count > 1"
          type="button"
          class="btn"
          :disabled="exporting"
          @click="downloadAll"
        >
          Download all as ZIP
        </button>

        <CrossToolLinks />
        <p v-if="status" class="status">{{ status }}</p>
      </div>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
    <SeoBlurb title="Convert audio online" :points="seoPoints" />
  </section>
</template>
