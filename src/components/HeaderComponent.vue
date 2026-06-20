<template>
  <header class="flex items-center justify-between px-3 sm:px-5 py-2 sm:py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50 shrink-0">
    <!-- Left: Undo/Redo -->
    <div class="flex items-center gap-1.5 w-auto lg:w-[200px]">
      <button @click="undo" :disabled="!canUndoVal" class="header-btn" title="撤销 (Ctrl+Z)">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h10a5 5 0 015 5v2M3 10l4-4M3 10l4 4"/></svg>
      </button>
      <button @click="redo" :disabled="!canRedoVal" class="header-btn" title="重做 (Ctrl+Shift+Z)">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 10H11a5 5 0 00-5 5v2M21 10l-4-4M21 10l-4 4"/></svg>
      </button>
    </div>

    <!-- Center: Title -->
    <div class="flex-1 flex justify-center">
      <div class="flex items-center gap-1.5 sm:gap-2.5">
        <div class="w-7 h-7 rounded-lg bg-indigo-400 flex items-center justify-center shadow-md shadow-indigo-400/25">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
        </div>
        <h1 class="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 tracking-tight select-none" style="font-family: Inter, sans-serif">
          Cover-Wave
        </h1>
        <span class="hidden sm:inline text-[9px] text-slate-400 dark:text-slate-500 font-medium bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">v2.0</span>
      </div>
    </div>

    <!-- Right: Controls -->
    <div class="flex items-center gap-1.5 justify-end w-auto lg:w-[200px]">
      <button @click="toggleTheme" class="header-btn" title="切换主题">
        <svg v-if="!isDarkVal" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
      </button>
      <button @click="showShortcuts = !showShortcuts" class="header-btn hidden sm:flex" title="快捷键">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/></svg>
      </button>
      <a href="https://github.com/xiatianz/cover" target="_blank" class="header-btn" title="GitHub">
        <svg height="16" viewBox="0 0 16 16" width="16"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
      </a>
    </div>

    <!-- Shortcuts popup -->
    <Transition name="dropdown">
      <div v-if="showShortcuts" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showShortcuts=false">
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-700">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100">快捷键</h3>
            <button @click="showShortcuts=false" class="p-1 text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 rounded"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button>
          </div>
          <div class="space-y-2 text-xs">
            <div class="flex justify-between"><span class="text-slate-500 dark:text-slate-400">撤销</span><kbd class="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300 font-mono">Ctrl+Z</kbd></div>
            <div class="flex justify-between"><span class="text-slate-500 dark:text-slate-400">重做</span><kbd class="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300 font-mono">Ctrl+Shift+Z</kbd></div>
            <div class="flex justify-between"><span class="text-slate-500 dark:text-slate-400">保存图片</span><kbd class="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300 font-mono">Ctrl+S</kbd></div>
            <div class="flex justify-between"><span class="text-slate-500 dark:text-slate-400">复制到剪贴板</span><kbd class="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300 font-mono">Ctrl+C</kbd></div>
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { undo, redo, canUndo, canRedo } from '../composables/useCanvas'
import { useTheme } from '../composables/useTheme'

const { isDark, toggle: toggleTheme } = useTheme()
const showShortcuts = ref(false)

const isDarkVal = isDark
const canUndoVal = canUndo
const canRedoVal = canRedo
</script>

<style scoped>
.header-btn {
  @apply p-1.5 rounded-md text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-all disabled:opacity-30 disabled:cursor-not-allowed;
}
</style>
