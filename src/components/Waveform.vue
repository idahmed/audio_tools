<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { peakEnvelope } from '@/lib/audio'

const props = defineProps({
  buffer: { type: Object, default: null },
  start: { type: Number, default: 0 },
  end: { type: Number, default: 0 },
})

const canvas = ref(null)
let frame = 0

function draw() {
  const el = canvas.value
  if (!el || !props.buffer) return

  const ratio = window.devicePixelRatio || 1
  const width = el.clientWidth
  const height = el.clientHeight
  el.width = Math.max(1, Math.floor(width * ratio))
  el.height = Math.max(1, Math.floor(height * ratio))

  const ctx = el.getContext('2d')
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
  ctx.clearRect(0, 0, width, height)

  const style = getComputedStyle(document.documentElement)
  const ink = style.getPropertyValue('--ink').trim() || '#1c1c1c'
  const line = style.getPropertyValue('--line').trim() || '#e6e6e6'
  const soft = style.getPropertyValue('--soft').trim() || '#8a8a8a'

  ctx.fillStyle = line
  ctx.fillRect(0, 0, width, height)

  const duration = props.buffer.duration || 1
  const from = Math.max(0, Math.min(props.start, props.end)) / duration
  const to = Math.max(props.start, props.end) / duration
  ctx.fillStyle = ink
  ctx.globalAlpha = 0.12
  ctx.fillRect(from * width, 0, Math.max(1, (to - from) * width), height)
  ctx.globalAlpha = 1

  const peaks = peakEnvelope(props.buffer, Math.max(40, Math.floor(width / 3)))
  const mid = height / 2
  const gap = width / peaks.length
  ctx.fillStyle = soft
  for (let i = 0; i < peaks.length; i += 1) {
    const h = Math.max(2, peaks[i] * (height * 0.85))
    const x = i * gap
    const selected = i / peaks.length >= from && i / peaks.length <= to
    ctx.globalAlpha = selected ? 1 : 0.35
    ctx.fillStyle = selected ? ink : soft
    ctx.fillRect(x, mid - h / 2, Math.max(1, gap * 0.7), h)
  }
  ctx.globalAlpha = 1
}

function schedule() {
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(draw)
}

watch(() => [props.buffer, props.start, props.end], schedule)
onMounted(() => {
  schedule()
  window.addEventListener('resize', schedule)
})
onUnmounted(() => {
  cancelAnimationFrame(frame)
  window.removeEventListener('resize', schedule)
})
</script>

<template>
  <canvas ref="canvas" class="waveform" aria-hidden="true" />
</template>
