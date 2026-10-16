<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import AudioPlayer from '@/components/AudioPlayer.vue'
import CrossToolLinks from '@/components/CrossToolLinks.vue'
import DropZone from '@/components/DropZone.vue'
import QueueBar from '@/components/QueueBar.vue'
import ResultBar from '@/components/ResultBar.vue'
import SeoBlurb from '@/components/SeoBlurb.vue'
import { useAudioSource } from '@/composables/useAudioSource'
import { getTool } from '@/tools'
import {
  changeVolume,
  downloadBlob,
  encodeMp3,
  formatBytes,
  formatTime,
  normalizeBuffer,
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

const mode = ref('normalize')
const percent = ref(100)
const exporting = ref(false)
const status = ref('')
const resultUrl = ref('')
const resultSize = ref(0)

let alive = true
let timer

const originalMeta = computed(() => {
  if (!source.value) return ''
  return `${formatTime(source.value.duration)} · ${formatBytes(source.value.size)}`
})

const resultMeta = computed(() => {
  if (!resultUrl.value) return ''
  return formatBytes(resultSize.value)
})

const seoPoints = [
  'Normalize quiet recordings or raise and lower volume locally.',
  'Nothing is uploaded — processing stays in your browser.',
  'Export as MP3 when the level sounds right.',
]

const seoFaq = getTool('volume')?.faq ?? []


watch([source, mode, percent], () => {
  clearTimeout(timer)
  if (!source.value) {
    revokeResult()
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
  clearDraft()
}

function buildBuffer() {
  if (mode.value === 'normalize') return normalizeBuffer(source.value.buffer)
  return changeVolume(source.value.buffer, percent.value)
}

async function updatePreview() {
  if (!source.value) return
  status.value = 'Working…'
  try {
    const buffer = buildBuffer()
    const blob = encodeMp3(buffer, 192)
    if (!alive) return
    if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
    resultUrl.value = URL.createObjectURL(blob)
    resultSize.value = blob.size
    setDraft(buffer, source.value.name)
    status.value = ''
  } catch {
    if (!alive) return
    revokeResult()
    status.value = 'Could not adjust volume.'
  }
}

async function download() {
  if (!source.value) return
  exporting.value = true
  try {
    const blob = encodeMp3(buildBuffer(), 192)
    const tag = mode.value === 'normalize' ? 'normalized' : `${percent.value}pct`
    downloadBlob(blob, `${source.value.name}-${tag}.mp3`)
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <section class="tool">
    <header class="tool-head">
      <h2>Volume</h2>
      <p>Normalize peaks or boost and quieten levels.</p>
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
        <div class="chips">
          <button
            type="button"
            class="chip"
            :class="{ active: mode === 'normalize' }"
            @click="mode = 'normalize'"
          >
            Normalize
          </button>
          <button
            type="button"
            class="chip"
            :class="{ active: mode === 'volume' }"
            @click="mode = 'volume'"
          >
            Volume
          </button>
        </div>

        <label v-if="mode === 'volume'" class="field">
          <span>Level · {{ percent }}%</span>
          <input v-model.number="percent" type="range" min="10" max="300" step="5">
        </label>

        <ResultBar
          :busy="exporting"
          :ready="!!source"
          @download="download"
          @clear="clear"
        />
        <CrossToolLinks />
        <p v-if="status" class="status">{{ status }}</p>
      </div>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
    <SeoBlurb :faq="seoFaq" title="Normalize audio online" :points="seoPoints" />
  </section>
</template>
