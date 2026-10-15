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
  downloadBlob,
  encodeMp3,
  fadeBuffer,
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

const fadeIn = ref(0.5)
const fadeOut = ref(0.5)
const exporting = ref(false)
const status = ref('')
const resultUrl = ref('')
const resultSize = ref(0)

let alive = true
let timer

const maxFade = computed(() => {
  if (!source.value) return 5
  return Math.max(0.1, Number((source.value.duration / 2).toFixed(1)))
})

const originalMeta = computed(() => {
  if (!source.value) return ''
  return `${formatTime(source.value.duration)} · ${formatBytes(source.value.size)}`
})

const resultMeta = computed(() => {
  if (!resultUrl.value) return ''
  return formatBytes(resultSize.value)
})

const seoPoints = [
  'Add smooth fade in and fade out without uploading audio.',
  'Useful for podcasts, voice notes, and short clips.',
  'Export as MP3 when the fades sound right.',
]

watch(source, () => {
  fadeIn.value = Math.min(0.5, maxFade.value)
  fadeOut.value = Math.min(0.5, maxFade.value)
})

watch([source, fadeIn, fadeOut], () => {
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

async function updatePreview() {
  if (!source.value) return
  status.value = 'Working…'
  try {
    const buffer = fadeBuffer(source.value.buffer, fadeIn.value, fadeOut.value)
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
    status.value = 'Could not apply fade.'
  }
}

async function download() {
  if (!source.value) return
  exporting.value = true
  try {
    const buffer = fadeBuffer(source.value.buffer, fadeIn.value, fadeOut.value)
    const blob = encodeMp3(buffer, 192)
    downloadBlob(blob, `${source.value.name}-fade.mp3`)
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <section class="tool">
    <header class="tool-head">
      <h2>Fade</h2>
      <p>Fade in at the start and fade out at the end.</p>
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
        <div class="row">
          <label class="field">
            <span>Fade in · {{ fadeIn.toFixed(1) }}s</span>
            <input v-model.number="fadeIn" type="range" min="0" :max="maxFade" step="0.1">
          </label>
          <label class="field">
            <span>Fade out · {{ fadeOut.toFixed(1) }}s</span>
            <input v-model.number="fadeOut" type="range" min="0" :max="maxFade" step="0.1">
          </label>
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
    <SeoBlurb title="Fade audio online" :points="seoPoints" />
  </section>
</template>
