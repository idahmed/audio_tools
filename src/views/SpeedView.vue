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
  changeSpeed,
  downloadBlob,
  encodeMp3,
  formatBytes,
  formatTime,
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

const rate = ref(1)
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

const tool = getTool('speed')
const seoPoints = tool?.points ?? []
const seoFaq = tool?.faq ?? []
const seoLede = tool?.lede ?? ''
const seoSteps = tool?.steps ?? []
const seoNote = tool?.note ?? ''


watch([source, rate], () => {
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
  resultDuration.value = 0
  clearDraft()
}

async function updatePreview() {
  if (!source.value) return
  status.value = 'Working…'
  try {
    const buffer = changeSpeed(source.value.buffer, rate.value)
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
    status.value = 'Could not change speed.'
  }
}

async function download() {
  if (!source.value) return
  exporting.value = true
  try {
    const buffer = changeSpeed(source.value.buffer, rate.value)
    const blob = encodeMp3(buffer, 192)
    downloadBlob(blob, `${source.value.name}-${rate.value}x.mp3`)
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <section class="tool">
    <header class="tool-head">
      <h2>Speed</h2>
      <p>Speed up or slow down audio. Pitch follows speed.</p>
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
          <span>Speed · {{ rate.toFixed(2) }}x</span>
          <input v-model.number="rate" type="range" min="0.5" max="2" step="0.05">
        </label>

        <div class="chips">
          <button type="button" class="chip" :class="{ active: rate === 0.5 }" @click="rate = 0.5">
            0.5x
          </button>
          <button type="button" class="chip" :class="{ active: rate === 1 }" @click="rate = 1">
            1x
          </button>
          <button type="button" class="chip" :class="{ active: rate === 1.5 }" @click="rate = 1.5">
            1.5x
          </button>
          <button type="button" class="chip" :class="{ active: rate === 2 }" @click="rate = 2">
            2x
          </button>
        </div>

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
    <SeoBlurb :faq="seoFaq" :title="tool?.heading || tool?.title || 'Tool'" :lede="seoLede" :points="seoPoints" :steps="seoSteps" :note="seoNote" />
  </section>
</template>
