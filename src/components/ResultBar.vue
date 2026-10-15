<script setup>
import { useAudioSource } from '@/composables/useAudioSource'

defineProps({
  busy: { type: Boolean, default: false },
  ready: { type: Boolean, default: true },
})

defineEmits(['download', 'clear'])

const { canUndo, undo } = useAudioSource()
</script>

<template>
  <div class="actions">
    <button
      type="button"
      class="btn primary"
      :disabled="busy || !ready"
      @click="$emit('download')"
    >
      {{ busy ? 'Working…' : 'Download' }}
    </button>
    <button type="button" class="btn" :disabled="busy || !canUndo" @click="undo">
      Undo
    </button>
    <button type="button" class="btn" @click="$emit('clear')">New</button>
  </div>
</template>
