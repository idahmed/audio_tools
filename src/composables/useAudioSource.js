import { computed, ref } from 'vue'
import { loadAudio, releaseAudio } from '@/lib/audio'

const items = ref([])
const current = ref(0)
const error = ref('')

const source = computed(() => items.value[current.value] || null)
const count = computed(() => items.value.length)

export function useAudioSource() {
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
    } catch {
      error.value = 'Could not decode one of the audio files.'
    }
  }

  async function replaceFile(file) {
    error.value = ''
    if (!file || !file.type.startsWith('audio/')) {
      error.value = 'Please choose a valid audio file.'
      return
    }
    try {
      const loaded = await loadAudio(file)
      const next = [...items.value]
      if (next[current.value]) releaseAudio(next[current.value])
      if (next.length) {
        next[current.value] = loaded
        items.value = next
      } else {
        items.value = [loaded]
        current.value = 0
      }
    } catch {
      error.value = 'Could not decode that audio file.'
    }
  }

  function select(index) {
    if (index >= 0 && index < items.value.length) current.value = index
  }

  function removeCurrent() {
    const next = [...items.value]
    const [removed] = next.splice(current.value, 1)
    if (removed) releaseAudio(removed)
    items.value = next
    current.value = Math.max(0, Math.min(current.value, next.length - 1))
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
  }

  return {
    items,
    current,
    source,
    count,
    error,
    addFiles,
    replaceFile,
    select,
    removeCurrent,
    move,
    clear,
  }
}
