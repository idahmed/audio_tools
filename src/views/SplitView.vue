<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import AudioPlayer from '@/components/AudioPlayer.vue'
import CrossToolLinks from '@/components/CrossToolLinks.vue'
import DropZone from '@/components/DropZone.vue'
import QueueBar from '@/components/QueueBar.vue'
import SeoBlurb from '@/components/SeoBlurb.vue'
import { useAudioSource } from '@/composables/useAudioSource'
import {
  downloadBlob,
  encodeMp3,
  formatBytes,
  formatTime,
  splitBuffer,
} from '@/lib/audio'
import { downloadZip } from '@/lib/batch'

const {
  items,
  current,
  source,
  error,
  addFiles,
  setDraft,
  clearDraft,
  canUndo,
  undo,
  select,
  removeCurrent,
  clear,
} = useAudioSource()

const cut = ref(0)
const exporting = ref(false)
const status = ref('')
const partAUrl = ref('')
const partBUrl = ref('')
const partASize = ref(0)
const partBSize = ref(0)
const partADur = ref(0)
const partBDur = ref(0)

let alive = true
let timer

const originalMeta = computed(() => {
  if (!source.value) return ''
  return `${formatTime(source.value.duration)} · ${formatBytes(source.value.size)}`
})

const partAMeta = computed(() => {
  if (!partAUrl.value) return ''
  return `${formatTime(partADur.value)} · ${formatBytes(partASize.value)}`
})

const partBMeta = computed(() => {
  if (!partBUrl.value) return ''
  return `${formatTime(partBDur.value)} · ${formatBytes(partBSize.value)}`
})

const seoPoints = [
  'Split one clip into two at a chosen point.',
  'Download either part or both as a ZIP.',
  'Everything stays on your device.',
]

watch(source, (value) => {
  revokeParts()
  if (!value) return
  cut.value = Number((value.duration / 2).toFixed(2))
})

watch([source, cut], () => {
  clearTimeout(timer)
  if (!source.value) return
  timer = setTimeout(updatePreview, 220)
})

onUnmounted(() => {
  alive = false
  clearTimeout(timer)
  revokeParts()
})

function revokeParts() {
  if (partAUrl.value) URL.revokeObjectURL(partAUrl.value)
  if (partBUrl.value) URL.revokeObjectURL(partBUrl.value)
  partAUrl.value = ''
  partBUrl.value = ''
  partASize.value = 0
  partBSize.value = 0
  partADur.value = 0
  partBDur.value = 0
  clearDraft()
}

async function updatePreview() {
  if (!source.value) return
  status.value = 'Working…'
  try {
    const [a, b] = splitBuffer(source.value.buffer, cut.value)
    const blobA = encodeMp3(a, 192)
    const blobB = encodeMp3(b, 192)
    if (!alive) return
    if (partAUrl.value) URL.revokeObjectURL(partAUrl.value)
    if (partBUrl.value) URL.revokeObjectURL(partBUrl.value)
    partAUrl.value = URL.createObjectURL(blobA)
    partBUrl.value = URL.createObjectURL(blobB)
    partASize.value = blobA.size
    partBSize.value = blobB.size
    partADur.value = a.duration
    partBDur.value = b.duration
    setDraft(a, `${source.value.name}-a`)
    status.value = ''
  } catch {
    if (!alive) return
    revokeParts()
    status.value = 'Could not split audio.'
  }
}

async function downloadPart(which) {
  if (!source.value) return
  exporting.value = true
  try {
    const [a, b] = splitBuffer(source.value.buffer, cut.value)
    const buffer = which === 'a' ? a : b
    const blob = encodeMp3(buffer, 192)
    downloadBlob(blob, `${source.value.name}-part${which}.mp3`)
  } finally {
    exporting.value = false
  }
}

async function downloadBoth() {
  if (!source.value) return
  exporting.value = true
  status.value = 'Preparing zip…'
  try {
    const [a, b] = splitBuffer(source.value.buffer, cut.value)
    await downloadZip([
      { name: `${source.value.name}-parta.mp3`, blob: encodeMp3(a, 192) },
      { name: `${source.value.name}-partb.mp3`, blob: encodeMp3(b, 192) },
    ], `${source.value.name}-split.zip`)
    status.value = 'Zip ready · 2 files'
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
      <h2>Split</h2>
      <p>Cut one file into two parts at a chosen time.</p>
    </header>

    <DropZone v-if="!source" @files="addFiles" />

    <div v-else class="workspace">
      <QueueBar
        :items="items"
        :current="current"
        @select="select"
        @remove="removeCurrent"
      />

      <p class="status">Original · {{ originalMeta }}</p>

      <div class="players">
        <AudioPlayer label="Part A" :url="partAUrl" :meta="partAMeta" />
        <AudioPlayer label="Part B" :url="partBUrl" :meta="partBMeta" />
      </div>

      <div class="controls">
        <label class="field">
          <span>Split at · {{ formatTime(cut) }}</span>
          <input
            v-model.number="cut"
            type="range"
            min="0.1"
            :max="Math.max(0.2, source.duration - 0.1)"
            step="0.1"
          >
        </label>

        <div class="actions">
          <button type="button" class="btn primary" :disabled="exporting" @click="downloadPart('a')">
            Download A
          </button>
          <button type="button" class="btn primary" :disabled="exporting" @click="downloadPart('b')">
            Download B
          </button>
          <button type="button" class="btn" :disabled="exporting" @click="downloadBoth">
            {{ exporting ? 'Working…' : 'ZIP both' }}
          </button>
          <button type="button" class="btn" :disabled="exporting || !canUndo" @click="undo">
            Undo
          </button>
          <button type="button" class="btn" @click="clear">New</button>
        </div>

        <CrossToolLinks />
        <p v-if="status" class="status">{{ status }}</p>
      </div>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
    <SeoBlurb title="Split audio online" :points="seoPoints" />
  </section>
</template>
