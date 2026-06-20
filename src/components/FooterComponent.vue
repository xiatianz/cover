<template>
  <footer class="py-2 px-5 flex justify-between items-center text-xs text-slate-400 dark:text-slate-500 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200/30 dark:border-slate-700/30 shrink-0">
    <div class="flex items-center gap-2">
      <span>© 2024</span>
      <a href="https://ehon.cn" target="_blank" class="text-[#409eff] hover:text-[#66b1ff] transition-colors font-medium">Cover-Wave</a>
      <span v-if="icpNumber" class="hidden sm:inline">
        <a href="https://beian.miit.gov.cn/" target="_blank" class="hover:text-[#66b1ff] transition-colors">{{ icpNumber }}</a>
      </span>
      <span v-if="policeNumber" class="hidden sm:inline-flex items-center gap-1">
        <img :src="policeIconPath" alt="" class="w-3 h-3" />
        <a :href="`https://www.beian.gov.cn/portal/registerSystemInfo?recordcode=${policeNumber.match(/\d+/)[0]}`" target="_blank" class="hover:text-[#66b1ff] transition-colors">{{ policeNumber }}</a>
      </span>
    </div>
    <div class="flex items-center gap-3">
      <button class="hover:text-slate-600 dark:hover:text-slate-200 transition-colors font-medium" @click="toggleTips">提示</button>
      <button class="hover:text-slate-600 dark:hover:text-slate-200 transition-colors font-medium" @click="showTutorial = true">教程</button>
    </div>

    <!-- Tips toast - teleported to body -->
    <Teleport to="body">
      <Transition name="toast">
        <div v-if="showTips" class="fixed top-5 left-1/2 -translate-x-1/2 bg-slate-800/90 dark:bg-slate-700/90 backdrop-blur-sm text-white px-5 py-2.5 rounded-xl shadow-lg z-50 text-sm whitespace-nowrap font-medium">
          为避免性能问题，建议不要连续做图，经常刷新页面
        </div>
      </Transition>
    </Teleport>

    <!-- Tutorial modal - teleported to body -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showTutorial" class="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click="showTutorial = false">
          <div class="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_8px_24px_rgba(0,0,0,0.1)] border border-slate-200/50 dark:border-slate-700/50" @click.stop>
            <div class="flex items-center justify-between mb-5">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-[#409eff] shadow-md shadow-[#409eff]/25 flex items-center justify-center">
                  <svg class="w-4 h-4 text-white dark:text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100">图标使用教程</h3>
              </div>
              <button @click="showTutorial = false" class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition-all duration-150 active:scale-95">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div class="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div class="p-3.5 bg-slate-50/80 dark:bg-slate-700/50 rounded-xl border border-slate-100/80 dark:border-slate-600/80">
                <p class="font-semibold text-slate-700 dark:text-slate-200 mb-1.5">获取图标</p>
                <p>点击「图标库」复制图标代码（如 logos:chrome），粘贴到输入框即可</p>
              </div>
              <div class="p-3.5 bg-slate-50/80 dark:bg-slate-700/50 rounded-xl border border-slate-100/80 dark:border-slate-600/80">
                <p class="font-semibold text-slate-700 dark:text-slate-200 mb-1.5">调整功能</p>
                <p>拖拽移动 · 滑块调整大小 · 修改颜色 · 360度旋转</p>
              </div>
              <div class="p-3.5 bg-slate-50/80 dark:bg-slate-700/50 rounded-xl border border-slate-100/80 dark:border-slate-600/80">
                <p class="font-semibold text-slate-700 dark:text-slate-200 mb-1.5">推荐图标库</p>
                <p>iconify.design · feathericons.com · heroicons.com · tabler-icons.io</p>
              </div>
            </div>
            <div class="mt-5 flex justify-end">
              <button @click="showTutorial = false" class="btn-ok">知道了</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </footer>
</template>

<script setup>
import { ref } from 'vue'
const showTips = ref(false)
const showTutorial = ref(false)
const icpNumber = import.meta.env.VITE_APP_ICP_NUMBER
const policeNumber = import.meta.env.VITE_APP_POLICE_NUMBER
const policeIconPath = import.meta.env.VITE_APP_POLICE_ICON_PATH || '/tb.png'

let tipsTimer = null
function toggleTips() {
  showTips.value = true
  clearTimeout(tipsTimer)
  tipsTimer = setTimeout(() => { showTips.value = false }, 3000)
}
</script>

<style scoped>
.btn-ok { @apply px-5 py-2 text-xs font-semibold text-white bg-[#409eff] hover:bg-[#66b1ff] active:bg-[#3a8ee6] rounded-lg shadow-[0_1px_1px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.2)] active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] transition-all duration-150; }
.toast-enter-active { transition: all .3s cubic-bezier(.16,1,.3,1); }
.toast-leave-active { transition: all .2s ease-in; }
.toast-enter-from, .toast-leave-to { opacity:0; transform:translate(-50%,-16px); }
.modal-enter-active { transition: all .3s cubic-bezier(.16,1,.3,1); }
.modal-leave-active { transition: all .2s cubic-bezier(.4,0,1,1); }
.modal-enter-from, .modal-leave-to { opacity:0; transform:scale(.96) translateY(8px); }
</style>
