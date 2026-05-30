<template>
  <Teleport to="body">
    <TransitionGroup name="toast" tag="div" class="fixed top-4 left-1/2 -translate-x-1/2 z-[999] flex flex-col items-center gap-2 pointer-events-none">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="pointer-events-auto px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg backdrop-blur-sm flex items-center gap-2 min-w-[160px]"
        :class="typeClass(t.type)"
      >
        <span v-if="t.type==='success'" class="text-base">✓</span>
        <span v-else-if="t.type==='error'" class="text-base">✕</span>
        <span v-else class="text-base">ℹ</span>
        {{ t.message }}
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup>
import { useToast } from '../composables/useToast'
const { toasts } = useToast()
function typeClass(t) {
  return {
    'bg-emerald-600/90 text-white': t === 'success',
    'bg-red-500/90 text-white': t === 'error',
    'bg-stone-700/90 text-white dark:bg-stone-600/90': !t || t === 'info'
  }
}
</script>

<style scoped>
.toast-enter-active { transition: all .3s cubic-bezier(.16,1,.3,1); }
.toast-leave-active { transition: all .2s ease-in; }
.toast-enter-from { opacity:0; transform:translateY(-12px) scale(.95); }
.toast-leave-to { opacity:0; transform:translateY(-12px) scale(.95); }
.toast-move { transition: transform .3s ease; }
</style>
