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
  BITRATES,
  downloadBlob,
  encodeMp3,
  exportToTarget,
  formatBytes,
  formatTime,
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

const mode = ref('bitrate')
const bitrate = ref(128)
const targetKb = ref(1000)
const exporting = ref(false)
const status = ref('')
const resultUrl = ref('')
const resultSize = ref(0)
const usedBitrate = ref(128)

const originalMeta = computed(() => {
  if (!source.value) return ''
  return `${formatTime(source.value.duration)} · ${formatBytes(source.value.size)}`
})

const resultMeta = computed(() => {
  if (!resultUrl.value || !source.value) return ''
  const saved = Math.round((1 - resultSize.value / source.value.size) * 100)
  const note = saved > 0 ? ` · −${saved}%` : saved < 0 ? ` · +${Math.abs(saved)}%` : ''
  return `${formatBytes(resultSize.value)} · ${usedBitrate.value} kbps${note}`
})

const seoPoints = [
  'Reduce audio file size with MP3 bitrate control.',
  'Aim for a target size when forms or apps have upload limits.',
  'Compression runs locally for privacy and speed.',
]

let timer

watch([source, mode, bitrate, targetKb], () => {
  clearTimeout(timer)
  if (!source.value) {
    revokeResult()
    return
  }
  timer = setTimeout(updatePreview, 220)
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

async function buildBlob() {
  if (mode.value === 'target') {
    const packed = await exportToTarget(source.value.buffer, targetKb.value * 1024)
    usedBitrate.value = packed.kbps
    return packed.blob
  }
  usedBitrate.value = bitrate.value
  return encodeMp3(source.value.buffer, bitrate.value)
}

async function updatePreview() {
  if (!source.value) return
  status.value = 'Working…'
  try {
    const blob = await buildBlob()
    if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
    resultUrl.value = URL.createObjectURL(blob)
    resultSize.value = blob.size
    status.value = ''
  } catch {
    status.value = 'Could not compress audio.'
  }
}

async function download() {
  if (!source.value) return
  exporting.value = true
  try {
    const blob = resultUrl.value
      ? await fetch(resultUrl.value).then((res) => res.blob())
      : await buildBlob()
    downloadBlob(blob, `${source.value.name}-${usedBitrate.value}kbps.mp3`)
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <section class="tool">
    <header class="tool-head">
      <h2>Compress</h2>
      <p>Make audio smaller with bitrate or a target file size.</p>
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
        <AudioPlayer label="Compressed" :url="resultUrl" :meta="resultMeta" />
      </div>

      <div class="controls">
        <div class="chips">
          <button
            type="button"
            class="chip"
            :class="{ active: mode === 'bitrate' }"
            @click="mode = 'bitrate'"
          >
            Bitrate
          </button>
          <button
            type="button"
            class="chip"
            :class="{ active: mode === 'target' }"
            @click="mode = 'target'"
          >
            Target size
          </button>
        </div>

        <label v-if="mode === 'bitrate'" class="field">
          <span>Bitrate · {{ bitrate }} kbps</span>
          <select v-model.number="bitrate">
            <option v-for="rate in BITRATES" :key="rate" :value="rate">
              {{ rate }} kbps
            </option>
          </select>
        </label>

        <label v-else class="field">
          <span>Target · {{ targetKb }} KB</span>
          <input v-model.number="targetKb" type="range" min="100" max="10000" step="50">
        </label>

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
    <SeoBlurb title="Compress audio online" :points="seoPoints" />
  </section>
</template>
