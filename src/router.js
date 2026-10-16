import { createRouter, createWebHistory } from 'vue-router'
import { useAudioSource } from '@/composables/useAudioSource'
import { useSeo } from '@/composables/useSeo'
import { tools } from '@/tools'
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

const { commitDraft } = useAudioSource()
const { setPageSeo } = useSeo()

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
      meta: {
        title: tool.title,
        description: tool.description,
        heading: tool.heading,
        label: tool.label,
      },
    })),
    { path: '/help', redirect: '/convert' },
    { path: '/terms', redirect: '/convert' },
    { path: '/privacy', redirect: '/convert' },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach(async (to, from) => {
  if (to.path !== from.path) commitDraft()
})

router.afterEach((to) => {
  setPageSeo({
    title: to.meta.title || 'Free Online Audio Tools',
    description:
      to.meta.description ||
      'Free browser-based audio tools. Convert, compress, trim, merge, and edit audio locally. No uploads required.',
    path: to.path,
  })
})

export default router
