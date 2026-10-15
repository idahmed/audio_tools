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
  replaceFile,
  select,
  removeCurrent,
  clear,
} = useAudioSource()

const exporting = ref(false)
const status = ref('')
const resultUrl = ref('')
const resultSize = ref(0)

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

let timer

watch(source, () => {
  clearTimeout(timer)
  if (!source.value) {
    revokeResult()
    return
  }
  timer = setTimeout(updatePreview, 180)
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
  if (!source.value) return
  status.value = 'Working…'
  try {
    const buffer = reverseBuffer(source.value.buffer)
    const blob = encodeMp3(buffer, 192)
    if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
    resultUrl.value = URL.createObjectURL(blob)
    resultSize.value = blob.size
    status.value = ''
  } catch {
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
          @replace="replaceFile"
          @clear="clear"
        />
        <CrossToolLinks />
        <p v-if="status" class="status">{{ status }}</p>
      </div>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
    <SeoBlurb title="Reverse audio online" :points="seoPoints" />
  </section>
</template>
