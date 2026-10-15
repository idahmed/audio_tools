<script setup>
import { formatTime } from '@/lib/audio'

defineProps({
  items: { type: Array, required: true },
  current: { type: Number, required: true },
})

const emit = defineEmits(['select', 'remove'])
</script>

<template>
  <div v-if="items.length > 1" class="queue">
    <button
      v-for="(item, index) in items"
      :key="item.id"
      type="button"
      class="queue-item"
      :class="{ active: index === current }"
      @click="emit('select', index)"
    >
      <strong>{{ item.name }}</strong>
      <span>{{ formatTime(item.duration) }}</span>
    </button>
    <button type="button" class="btn ghost" @click="emit('remove')">
      Remove
    </button>
  </div>
</template>
