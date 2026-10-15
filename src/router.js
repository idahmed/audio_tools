import { createRouter, createWebHistory } from 'vue-router'
import { tools } from '@/tools'
import CompressView from '@/views/CompressView.vue'
import ConvertView from '@/views/ConvertView.vue'
import MergeView from '@/views/MergeView.vue'
import SpeedView from '@/views/SpeedView.vue'
import TrimView from '@/views/TrimView.vue'
import VolumeView from '@/views/VolumeView.vue'

const views = {
  convert: ConvertView,
  compress: CompressView,
  trim: TrimView,
  volume: VolumeView,
  merge: MergeView,
  speed: SpeedView,
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

router.afterEach((to) => {
  document.title = `${to.meta.title || 'Audio tools'} by sessea`
})

export default router
