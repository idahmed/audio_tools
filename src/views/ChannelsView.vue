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
  setChannels,
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

const mode = ref('mono')
const exporting = ref(false)
const status = ref('')
const resultUrl = ref('')
const resultSize = ref(0)
const resultChannels = ref(1)

let alive = true
let timer

const originalMeta = computed(() => {
  if (!source.value) return ''
  return `${formatTime(source.value.duration)} · ${source.value.channels} ch · ${formatBytes(source.value.size)}`
})

const resultMeta = computed(() => {
  if (!resultUrl.value) return ''
  return `${resultChannels.value} ch · ${formatBytes(resultSize.value)}`
})

const seoPoints = [
  'Convert stereo to mono or duplicate mono into stereo.',
  'Useful before merging clips or uploading to apps with channel limits.',
  'Runs locally — nothing is uploaded.',
]

const seoFaq = getTool('channels')?.faq ?? []


watch([source, mode], () => {
  clearTimeout(timer)
  if (!source.value) {
    revokeResult()
    return
  }
  timer = setTimeout(updatePreview, 200)
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
    const buffer = setChannels(source.value.buffer, mode.value)
    const blob = encodeMp3(buffer, 192)
    if (!alive) return
    if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
    resultUrl.value = URL.createObjectURL(blob)
    resultSize.value = blob.size
    resultChannels.value = buffer.numberOfChannels
    setDraft(buffer, source.value.name)
    status.value = ''
  } catch {
    if (!alive) return
    revokeResult()
    status.value = 'Could not change channels.'
  }
}

async function download() {
  if (!source.value) return
  exporting.value = true
  try {
    const buffer = setChannels(source.value.buffer, mode.value)
    const blob = encodeMp3(buffer, 192)
    downloadBlob(blob, `${source.value.name}-${mode.value}.mp3`)
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <section class="tool">
    <header class="tool-head">
      <h2>Channels</h2>
      <p>Switch between mono and stereo.</p>
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
            :class="{ active: mode === 'mono' }"
            @click="mode = 'mono'"
          >
            Mono
          </button>
          <button
            type="button"
            class="chip"
            :class="{ active: mode === 'stereo' }"
            @click="mode = 'stereo'"
          >
            Stereo
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
    <SeoBlurb :faq="seoFaq" title="Convert audio channels online" :points="seoPoints" />
  </section>
</template>
