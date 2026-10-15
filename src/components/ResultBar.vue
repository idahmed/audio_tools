<script setup>
defineProps({
  busy: { type: Boolean, default: false },
  ready: { type: Boolean, default: true },
})

defineEmits(['download', 'replace', 'clear'])
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
    <label class="btn file-btn">
      Replace
      <input
        type="file"
        accept="audio/*"
        hidden
        @change="$emit('replace', $event.target.files?.[0]); $event.target.value = ''"
      >
    </label>
    <button type="button" class="btn" @click="$emit('clear')">New</button>
  </div>
</template>
