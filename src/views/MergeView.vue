<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import AudioPlayer from '@/components/AudioPlayer.vue'
import CrossToolLinks from '@/components/CrossToolLinks.vue'
import DropZone from '@/components/DropZone.vue'
import ResultBar from '@/components/ResultBar.vue'
import SeoBlurb from '@/components/SeoBlurb.vue'
import { useAudioSource } from '@/composables/useAudioSource'
import {
  downloadBlob,
  encodeMp3,
  formatBytes,
  formatTime,
  mergeBuffers,
} from '@/lib/audio'

const {
  items,
  source,
  error,
  addFiles,
  setDraft,
  clearDraft,
  move,
  removeCurrent,
  select,
  clear,
} = useAudioSource()

const exporting = ref(false)
const status = ref('')
const resultUrl = ref('')
const resultSize = ref(0)
const resultDuration = ref(0)

let alive = true
let timer

const canExport = computed(() => items.value.length >= 2)

const totalMeta = computed(() => {
  if (!items.value.length) return ''
  const duration = items.value.reduce((sum, item) => sum + item.duration, 0)
  const size = items.value.reduce((sum, item) => sum + item.size, 0)
  return `${items.value.length} clips · ${formatTime(duration)} · ${formatBytes(size)}`
})

const resultMeta = computed(() => {
  if (!resultUrl.value) return ''
  return `${formatTime(resultDuration.value)} · ${formatBytes(resultSize.value)}`
})

const seoPoints = [
  'Join several clips into one file with simple concatenation.',
  'Reorder tracks before merging — processing stays local.',
  'Useful for voice notes, podcasts, and short edits.',
]

watch(items, () => {
  clearTimeout(timer)
  if (!canExport.value) {
    revokeResult()
    status.value = items.value.length ? 'Add at least two clips to merge.' : ''
    return
  }
  timer = setTimeout(updatePreview, 260)
}, { deep: true })

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
  if (!canExport.value) return
  status.value = 'Working…'
  try {
    const buffer = mergeBuffers(items.value.map((item) => item.buffer))
    const blob = encodeMp3(buffer, 192)
    if (!alive) return
    if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
    resultUrl.value = URL.createObjectURL(blob)
    resultSize.value = blob.size
    resultDuration.value = buffer.duration
    setDraft(buffer, 'merged', { replaceAll: true })
    status.value = ''
  } catch {
    if (!alive) return
    revokeResult()
    status.value = 'Could not merge audio.'
  }
}

async function download() {
  if (!canExport.value) return
  exporting.value = true
  try {
    const buffer = mergeBuffers(items.value.map((item) => item.buffer))
    const blob = encodeMp3(buffer, 192)
    downloadBlob(blob, 'merged.mp3')
  } finally {
    exporting.value = false
  }
}

function removeAt(index) {
  select(index)
  removeCurrent()
}
</script>

<template>
  <section class="tool">
    <header class="tool-head">
      <h2>Merge</h2>
      <p>Join clips in order into one MP3.</p>
    </header>

    <DropZone v-if="!source" @files="addFiles" />

    <div v-else class="workspace">
      <div class="merge-list">
        <div
          v-for="(item, index) in items"
          :key="item.id"
          class="merge-item"
        >
          <div>
            <strong>{{ index + 1 }}. {{ item.name }}</strong>
            <span>{{ formatTime(item.duration) }}</span>
          </div>
          <div class="merge-actions">
            <button type="button" class="btn ghost" :disabled="index === 0" @click="move(index, index - 1)">
              Up
            </button>
            <button
              type="button"
              class="btn ghost"
              :disabled="index === items.length - 1"
              @click="move(index, index + 1)"
            >
              Down
            </button>
            <button type="button" class="btn ghost" @click="removeAt(index)">
              Remove
            </button>
          </div>
        </div>
        <label class="file-btn">
          Add more
          <input
            type="file"
            accept="audio/*"
            multiple
            hidden
            @change="(event) => {
              const files = event.target.files
              if (files?.length) addFiles(files)
              event.target.value = ''
            }"
          >
        </label>
      </div>

      <div class="players">
        <AudioPlayer label="Queue" :url="source.url" :meta="totalMeta" />
        <AudioPlayer label="Merged" :url="resultUrl" :meta="resultMeta" />
      </div>

      <div class="controls">
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
    <SeoBlurb title="Merge audio online" :points="seoPoints" />
  </section>
</template>
