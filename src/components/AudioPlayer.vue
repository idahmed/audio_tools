<script setup>
defineProps({
  url: { type: String, default: '' },
  label: { type: String, default: 'Preview' },
  meta: { type: String, default: '' },
})

function onPlay(event) {
  document.querySelectorAll('audio').forEach((el) => {
    if (el !== event.target) el.pause()
  })
}
</script>

<template>
  <div class="player">
    <div class="player-head">
      <h3>{{ label }}</h3>
      <span v-if="meta">{{ meta }}</span>
    </div>
    <audio
      v-if="url"
      :key="url"
      :src="url"
      controls
      preload="metadata"
      @play="onPlay"
    />
    <p v-else class="player-empty">No audio yet</p>
  </div>
</template>
