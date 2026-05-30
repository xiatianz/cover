<template>
  <div class="relative flex-1 min-h-0 flex items-center justify-center overflow-hidden p-3 bg-slate-100/50 dark:bg-slate-900/50">
    <div class="w-full h-full flex items-center justify-center">
      <canvas
        id="canvasPreview"
        width="1000"
        height="500"
        @dragover.prevent="onDragOver"
        @dragleave.prevent="dragZone = null"
        @drop.prevent="onDrop"
        class="max-w-full max-h-full rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06),0_8px_32px_rgba(0,0,0,0.06)] border border-white/80 dark:border-stone-700/60 bg-white dark:bg-stone-800"
        style="object-fit:contain"
      ></canvas>
    </div>
    <!-- Drop zone highlights -->
    <Transition name="hl">
      <div v-if="dragZone === 'icon'" class="pointer-events-none absolute left-1/2 top-1/2 w-[200px] h-[200px] -translate-x-1/2 -translate-y-1/2 border-[3px] border-dashed border-emerald-400 rounded-3xl z-10"></div>
    </Transition>
    <Transition name="hl">
      <div v-if="dragZone === 'bg'" class="pointer-events-none absolute inset-3 border-[3px] border-dashed border-emerald-400 rounded-xl z-9"></div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { updatePreview } from '../composables/useCanvas'

const dragZone = ref(null)

function getDropArea(e) {
  const r = e.target.getBoundingClientRect()
  const x = e.clientX - r.left, y = e.clientY - r.top
  const d = Math.hypot(x - r.width / 2, y - r.height / 2)
  return d < 100 ? 'icon' : 'bg'
}
function onDragOver(e) { dragZone.value = getDropArea(e) }
function onDrop(e) {
  dragZone.value = null
  const f = e.dataTransfer.files[0]
  if (!f?.type.startsWith('image/')) return
  updatePreview(getDropArea(e) === 'icon' ? 'square' : 'bg', { target: { files: [f] } })
}
</script>

<style scoped>
.hl-enter-active { transition: all .2s ease-out; }
.hl-leave-active { transition: all .15s ease-in; }
.hl-enter-from, .hl-leave-to { opacity:0; transform:translate(-50%,-50%) scale(.95); }
</style>
