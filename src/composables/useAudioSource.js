import { computed, ref } from 'vue'
import { cloneBuffer, encodeWav, loadAudio, releaseAudio } from '@/lib/audio'

const MAX_HISTORY = 15

const items = ref([])
const current = ref(0)
const error = ref('')
const draft = ref(null)
const history = ref([])

const source = computed(() => items.value[current.value] || null)
const count = computed(() => items.value.length)
const canUndo = computed(() => history.value.length > 0)

function makeItem(buffer, name) {
  const copy = cloneBuffer(buffer)
  const wav = encodeWav(copy)
  const file = new File([wav], `${name}.wav`, { type: 'audio/wav' })
  const url = URL.createObjectURL(wav)
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    file,
    url,
    buffer: copy,
    name,
    duration: copy.duration,
    sampleRate: copy.sampleRate,
    channels: copy.numberOfChannels,
    size: wav.size,
    type: 'audio/wav',
  }
}

export function useAudioSource() {
  function clearHistory() {
    history.value.forEach((item) => releaseAudio(item))
    history.value = []
  }

  function pushHistory(item) {
    if (!item) return
    const next = [...history.value, item]
    while (next.length > MAX_HISTORY) {
      releaseAudio(next.shift())
    }
    history.value = next
  }

  async function addFiles(fileList) {
    error.value = ''
    const files = [...fileList].filter((file) => file.type.startsWith('audio/'))
    if (!files.length) {
      error.value = 'Please choose valid audio files.'
      return
    }

    try {
      const loaded = []
      for (const file of files) {
        loaded.push(await loadAudio(file))
      }
      const start = items.value.length
      items.value = [...items.value, ...loaded]
      current.value = start
      clearDraft()
      clearHistory()
    } catch {
      error.value = 'Could not decode one of the audio files.'
    }
  }

  async function replaceFile(file, { remember = false } = {}) {
    error.value = ''
    if (!file || !file.type.startsWith('audio/')) {
      error.value = 'Please choose a valid audio file.'
      return
    }
    try {
      const loaded = await loadAudio(file)
      applyItem(loaded, { remember })
    } catch {
      error.value = 'Could not decode that audio file.'
    }
  }

  function replaceWithBuffer(buffer, name = 'audio', { remember = true, replaceAll = false } = {}) {
    if (!buffer) return
    applyItem(makeItem(buffer, name), { remember, replaceAll })
  }

  function applyItem(loaded, { remember = false, replaceAll = false } = {}) {
    if (replaceAll) {
      if (remember && source.value) pushHistory(source.value)
      items.value.forEach((item) => {
        if (item !== source.value) releaseAudio(item)
      })
      items.value = [loaded]
      current.value = 0
      clearDraft()
      return
    }

    const next = [...items.value]
    const prev = next[current.value]
    if (remember && prev) pushHistory(prev)
    else if (prev) releaseAudio(prev)

    if (next.length) {
      next[current.value] = loaded
      items.value = next
    } else {
      items.value = [loaded]
      current.value = 0
    }
    clearDraft()
  }

  function setDraft(buffer, name = 'audio', { replaceAll = false } = {}) {
    draft.value = buffer ? { buffer, name, replaceAll } : null
  }

  function clearDraft() {
    draft.value = null
  }

  function commitDraft() {
    const pending = draft.value
    if (!pending) return
    draft.value = null
    replaceWithBuffer(pending.buffer, pending.name, {
      remember: true,
      replaceAll: pending.replaceAll,
    })
  }

  function undo() {
    const prev = history.value[history.value.length - 1]
    if (!prev) return
    history.value = history.value.slice(0, -1)
    clearDraft()

    const next = [...items.value]
    const currentItem = next[current.value]
    if (currentItem) releaseAudio(currentItem)

    if (next.length) {
      next[current.value] = prev
      items.value = next
    } else {
      items.value = [prev]
      current.value = 0
    }
  }

  function select(index) {
    if (index >= 0 && index < items.value.length) {
      current.value = index
      clearDraft()
      clearHistory()
    }
  }

  function removeCurrent() {
    const next = [...items.value]
    const [removed] = next.splice(current.value, 1)
    if (removed) releaseAudio(removed)
    items.value = next
    current.value = Math.max(0, Math.min(current.value, next.length - 1))
    clearDraft()
    clearHistory()
  }

  function move(from, to) {
    if (to < 0 || to >= items.value.length) return
    const next = [...items.value]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    items.value = next
    if (current.value === from) current.value = to
    else if (from < current.value && to >= current.value) current.value -= 1
    else if (from > current.value && to <= current.value) current.value += 1
  }

  function clear() {
    items.value.forEach((item) => releaseAudio(item))
    items.value = []
    current.value = 0
    error.value = ''
    clearDraft()
    clearHistory()
  }

  return {
    items,
    current,
    source,
    count,
    error,
    canUndo,
    addFiles,
    replaceFile,
    replaceWithBuffer,
    setDraft,
    clearDraft,
    commitDraft,
    undo,
    select,
    removeCurrent,
    move,
    clear,
  }
}
