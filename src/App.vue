<template>
  <div class="h-screen flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
    <HeaderComponent class="shrink-0" />
    <CoverGenerator class="flex-1 min-h-0" />
    <FooterComponent class="shrink-0" />
    <ToastContainer />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import HeaderComponent from './components/HeaderComponent.vue'
import CoverGenerator from './components/CoverGenerator.vue'
import FooterComponent from './components/FooterComponent.vue'
import ToastContainer from './components/ToastContainer.vue'
import { undo, redo, saveImage, copyToClipboard } from './composables/useCanvas'
import { useTheme } from './composables/useTheme'
import { useToast } from './composables/useToast'
import { defaultConfig } from './config'

const { init: initTheme } = useTheme()
const { addToast } = useToast()

onMounted(() => {
  initTheme()
  loadFonts()
  setupKeyboardShortcuts()
})

function loadFonts() {
  const existing = new Set(Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l => l.href))
  defaultConfig.fontStyles.forEach(url => {
    if (!existing.has(url)) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'; link.href = url
      document.head.appendChild(link)
    }
  })
}

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', e => {
    const ctrl = e.ctrlKey || e.metaKey
    if (ctrl && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
    if (ctrl && e.key === 'z' && e.shiftKey) { e.preventDefault(); redo() }
    if (ctrl && e.key === 'Z') { e.preventDefault(); redo() }
    if (ctrl && e.key === 's') { e.preventDefault(); saveImage('png'); addToast('图片已保存', 'success') }
  })
}
</script>
