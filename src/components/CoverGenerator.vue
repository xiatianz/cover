<template>
  <main class="h-full flex flex-col lg:flex-row gap-3 p-3 overflow-hidden">
    <ControlPanel @open-settings="showSettings = true" />
    <CanvasPreview />
    <SettingsModal v-model="showSettings" @platform-changed="onPlatformChanged" />
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { state, updatePreview, updateCanvasSizes, initialize } from '../composables/useCanvas'
import ControlPanel from './ControlPanel.vue'
import CanvasPreview from './CanvasPreview.vue'
import SettingsModal from './SettingsModal.vue'

const showSettings = ref(false)

onMounted(() => {
  initialize()
})

function onPlatformChanged(platform) {
  const canvas = document.getElementById('canvasPreview')
  if (!canvas || platform.id === 'custom') return
  canvas.width = platform.width
  canvas.height = platform.height
  updateCanvasSizes(platform.width, platform.height)
  updatePreview('resize')
}
</script>
