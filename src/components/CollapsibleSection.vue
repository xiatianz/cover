<template>
  <div class="border-b border-slate-200/50 dark:border-slate-700/50 last:border-b-0">
    <button
      @click="open = !open"
      class="w-full flex items-center justify-between px-3 py-1.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors duration-150"
    >
      <div class="flex items-center gap-1.5">
        <slot name="icon" />
        <span class="text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{{ title }}</span>
      </div>
      <svg
        class="w-3 h-3 text-slate-400 transition-transform duration-200"
        :class="{ 'rotate-180': open }"
        fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
      ><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
    </button>
    <div
      class="overflow-hidden transition-all duration-300 ease-out"
      :style="{ maxHeight: open ? '400px' : '0px', opacity: open ? 1 : 0 }"
    >
      <div class="px-3 pb-2">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({
  title: { type: String, required: true },
  defaultOpen: { type: Boolean, default: true }
})
const open = ref(props.defaultOpen)
</script>
