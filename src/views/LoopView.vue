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
  downloadBlob,
  encodeMp3,
  formatBytes,
  formatTime,
  loopBuffer,
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

const times = ref(2)
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

const tool = getTool('loop')
const seoPoints = tool?.points ?? []
const seoFaq = tool?.faq ?? []
const seoLede = tool?.lede ?? ''
const seoSteps = tool?.steps ?? []
const seoNote = tool?.note ?? ''


watch([source, times], () => {
  clearTimeout(timer)
  if (!source.value) {
    revokeResult()
    return
  }
  timer = setTimeout(updatePreview, 240)
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
    const buffer = loopBuffer(source.value.buffer, times.value)
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
    status.value = 'Could not loop audio.'
  }
}

async function download() {
  if (!source.value) return
  exporting.value = true
  try {
    const buffer = loopBuffer(source.value.buffer, times.value)
    const blob = encodeMp3(buffer, 192)
    downloadBlob(blob, `${source.value.name}-x${times.value}.mp3`)
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <section class="tool">
    <header class="tool-head">
      <h2>Loop</h2>
      <p>Repeat the clip into one longer file.</p>
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
        <AudioPlayer label="Looped" :url="resultUrl" :meta="resultMeta" />
      </div>

      <div class="controls">
        <label class="field">
          <span>Repeat · {{ times }}x</span>
          <input v-model.number="times" type="range" min="2" max="12" step="1">
        </label>

        <div class="chips">
          <button type="button" class="chip" :class="{ active: times === 2 }" @click="times = 2">
            2x
          </button>
          <button type="button" class="chip" :class="{ active: times === 4 }" @click="times = 4">
            4x
          </button>
          <button type="button" class="chip" :class="{ active: times === 8 }" @click="times = 8">
            8x
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
