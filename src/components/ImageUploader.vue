<template>
  <div class="flex items-center gap-2">
    <button @click="showQR = true" class="btn-secondary">
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/></svg>
      获取外链
    </button>
    <button @click="resetAll" class="btn-ghost" title="重置所有设置">
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
      重置
    </button>

    <!-- QR Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showQR" class="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="showQR = false">
          <div class="relative bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl w-full max-w-[300px] overflow-hidden shadow-2xl border border-slate-200/60 dark:border-slate-700/60">
            <div class="p-7">
              <button @click="showQR = false" class="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition-all">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
              <div class="text-center">
                <div class="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-rose-400 via-orange-500 to-amber-500 shadow-md shadow-orange-500/25 flex items-center justify-center shadow-sm">
                  <svg class="w-6 h-6 text-white dark:text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/></svg>
                </div>
                <h4 class="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">夏图坞小程序</h4>
                <p class="text-xs text-slate-400 dark:text-slate-500 mb-5">微信扫码上传获取外链</p>
                <div class="inline-block p-2.5 bg-white dark:bg-slate-700 rounded-xl shadow-sm border border-slate-100 dark:border-slate-600">
                  <img src="/gh_7b56ae2626fe_258.jpg" alt="小程序二维码" class="w-44 h-44 rounded-lg object-cover" />
                </div>
                <p class="mt-4 text-xs text-slate-400 dark:text-slate-500">长按识别二维码</p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { state, updatePreview, takeSnapshot, drawAll } from '../composables/useCanvas'
import { useToast } from '../composables/useToast'
import { defaultConfig } from '../config'

const showQR = ref(false)
const { addToast } = useToast()

function resetAll() {
  takeSnapshot()
  state.bgImageUrl = null
  state.squareImageUrl = null
  state.bgColor = '#ffffff'
  state.bgGradient = null
  state.textColor = '#eeeeee'
  state.watermarkColor = '#dddddd'
  state.iconColor = '#eeeeee'
  state.rotation = 0
  state.shadowStrength = 60
  state.shadowColor = '#646464'
  state.watermark = defaultConfig.watermark
  state.text = defaultConfig.text
  state.textSize = 120
  state.lineHeight = 1
  state.text3D = 0
  state.squareSize = 300
  state.bgBlur = 3
  state.iconBgSize = 0
  state.selectedFont = defaultConfig.fontFamily
  state.iconOffsetX = 0
  state.iconOffsetY = 0
  state.hasMultipleLines = false
  drawAll()
  addToast('已重置所有设置', 'success')
}
</script>

<style scoped>
.btn-secondary { @apply inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium text-rose-600 dark:text-orange-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all; }
.btn-ghost { @apply inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium text-rose-500 dark:text-orange-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-700 dark:hover:text-orange-300 transition-all; }
.modal-enter-active { transition: all .3s cubic-bezier(.16,1,.3,1); }
.modal-leave-active { transition: all .2s cubic-bezier(.4,0,1,1); }
.modal-enter-from, .modal-leave-to { opacity:0; transform:scale(.96) translateY(8px); }
</style>
