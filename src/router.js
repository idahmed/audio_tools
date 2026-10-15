import { createRouter, createWebHistory } from 'vue-router'
import { useAudioSource } from '@/composables/useAudioSource'
import { tools } from '@/tools'

const { commitDraft } = useAudioSource()
import ChannelsView from '@/views/ChannelsView.vue'
import CompressView from '@/views/CompressView.vue'
import ConvertView from '@/views/ConvertView.vue'
import FadeView from '@/views/FadeView.vue'
import LoopView from '@/views/LoopView.vue'
import MergeView from '@/views/MergeView.vue'
import ReverseView from '@/views/ReverseView.vue'
import SpeedView from '@/views/SpeedView.vue'
import SplitView from '@/views/SplitView.vue'
import TrimView from '@/views/TrimView.vue'
import VolumeView from '@/views/VolumeView.vue'

const views = {
  convert: ConvertView,
  compress: CompressView,
  trim: TrimView,
  volume: VolumeView,
  merge: MergeView,
  speed: SpeedView,
  fade: FadeView,
  reverse: ReverseView,
  split: SplitView,
  channels: ChannelsView,
  loop: LoopView,
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/convert' },
    ...tools.map((tool) => ({
      path: tool.path,
      name: tool.name,
      component: views[tool.name],
      meta: { title: tool.title, label: tool.label },
    })),
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach(async (to, from) => {
  if (to.path !== from.path) commitDraft()
})

router.afterEach((to) => {
  document.title = `${to.meta.title || 'Audio tools'} by sessea`
})

export default router
