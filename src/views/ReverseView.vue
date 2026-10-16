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
  reverseBuffer,
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
  'Reverse any audio clip instantly in your browser.',
  'No upload required — processing stays on your device.',
  'Export the reversed track as MP3.',
]

const seoFaq = getTool('reverse')?.faq ?? []


watch(source, () => {
  clearTimeout(timer)
  if (!source.value) {
    revokeResult()
    return
  }
  timer = setTimeout(updatePreview, 180)
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
    const buffer = reverseBuffer(source.value.buffer)
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
    status.value = 'Could not reverse audio.'
  }
}

async function download() {
  if (!source.value) return
  exporting.value = true
  try {
    const buffer = reverseBuffer(source.value.buffer)
    const blob = encodeMp3(buffer, 192)
    downloadBlob(blob, `${source.value.name}-reverse.mp3`)
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <section class="tool">
    <header class="tool-head">
      <h2>Reverse</h2>
      <p>Play the clip backwards and export it.</p>
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
        <AudioPlayer label="Reversed" :url="resultUrl" :meta="resultMeta" />
      </div>

      <div class="controls">
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
    <SeoBlurb :faq="seoFaq" title="Reverse audio online" :points="seoPoints" />
  </section>
</template>
