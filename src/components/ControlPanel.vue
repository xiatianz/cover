<template>
  <aside class="w-full lg:w-[440px] lg:shrink-0 flex flex-col bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2),0_4px_16px_rgba(0,0,0,0.2)] border border-white/60 dark:border-stone-700/60 overflow-hidden">

    <!-- Quick Presets -->
    <div class="px-3 py-1.5 border-b border-stone-200/60 dark:border-stone-700/60 shrink-0">
      <div class="flex items-center gap-1 mb-1">
        <svg class="w-3 h-3 text-stone-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>
        <span class="text-sm font-bold text-stone-700 dark:text-stone-200">配色</span>
        <button @click="saveCurrentPreset" class="ml-auto text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">+ 收藏</button>
      </div>
      <div class="flex gap-1 flex-wrap">
        <button v-for="p in presets" :key="p.name" @click="applyPreset(p)" :title="p.name"
          class="w-6 h-6 rounded-md border border-white dark:border-stone-700 shadow-sm hover:scale-125 transition-transform"
          :style="{ background: p.swatch }"></button>
      </div>
      <div v-if="savedPresets.length" class="mt-1.5 pt-1.5 border-t border-stone-200/40 dark:border-stone-700/40 flex items-center gap-1 flex-wrap">
        <span class="text-[9px] text-stone-400">收藏:</span>
        <div v-for="(sp, idx) in savedPresets" :key="idx" class="relative group">
          <button @click="applySavedPreset(sp)" :title="sp.name"
            class="w-6 h-6 rounded-md border border-white dark:border-stone-700 shadow-sm hover:scale-125 transition-transform"
            :style="{ background: sp.swatch }"></button>
          <button @click="removeSavedPreset(idx)"
            class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 text-white rounded-full text-[6px] leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
        </div>
      </div>
    </div>

    <!-- Controls - all in one scrollable area -->
    <div class="flex-1 overflow-y-auto min-h-0 divide-y divide-stone-200/60 dark:divide-stone-700/60">

      <!-- 素材 + 背景 combined row -->
      <div class="px-3 py-2 space-y-1.5">
        <div class="flex items-center gap-1.5 mb-1">
          <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
          <span class="text-sm font-bold text-stone-700 dark:text-stone-200">素材</span>
        </div>
        <div class="flex gap-1.5 items-center">
          <input type="text" v-model="iconName" @input="loadIcon" placeholder="图标名 如 logos:chrome" class="ctrl flex-1" />
          <a href="https://yesicon.app/" target="_blank" class="btn-xs bg-amber-500 hover:bg-amber-600 text-white">图标库</a>
        </div>
        <div class="flex gap-1.5">
          <label for="inputBgImage" class="btn-xs bg-rose-500 hover:bg-rose-600 text-white flex-1 text-center cursor-pointer">上传背景</label>
          <input type="file" id="inputBgImage" accept="image/*" @change="onBgUpload" class="hidden" />
          <label for="inputSquareImage" class="btn-xs bg-indigo-500 hover:bg-indigo-600 text-white flex-1 text-center cursor-pointer">上传图标</label>
          <input type="file" id="inputSquareImage" accept="image/*" @change="onIconUpload" class="hidden" />
        </div>
        <Transition name="fade">
          <div v-if="state.bgImageUrl || state.squareImageUrl" class="flex gap-1.5">
            <button v-if="state.bgImageUrl" @click="clearBg" class="btn-xs bg-stone-100 dark:bg-stone-800 text-stone-500 flex-1">清除背景</button>
            <button v-if="state.squareImageUrl" @click="clearIcon" class="btn-xs bg-stone-100 dark:bg-stone-800 text-stone-500 flex-1">清除图标</button>
          </div>
        </Transition>
      </div>

      <!-- 背景 -->
      <div class="px-3 py-2 space-y-1.5">
        <div class="flex items-center gap-1.5 mb-1">
          <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          <span class="text-sm font-bold text-stone-700 dark:text-stone-200">背景</span>
        </div>
        <!-- Row: solid + gradient -->
        <div class="grid grid-cols-2 gap-1.5">
          <div class="flex items-center gap-1">
            <label class="lbl">纯色</label>
            <input type="color" v-model="state.bgColor" @input="onInput('bgColor', $event)" class="flex-1 h-6" />
          </div>
          <div class="flex items-center gap-1">
            <label class="lbl">渐变</label>
            <input type="color" :value="gradientA" @input="gradientA = $event.target.value; applyGradient()" class="flex-1 h-6" />
            <input type="color" :value="gradientB" @input="gradientB = $event.target.value; applyGradient()" class="flex-1 h-6" />
            <button v-if="state.bgGradient" @click="clearGradient" class="text-[9px] text-stone-400 hover:text-red-500 px-0.5">✕</button>
          </div>
        </div>
        <!-- Row: blur -->
        <div class="flex items-center gap-1">
          <label class="lbl">模糊</label>
          <input type="range" min="0" max="20" v-model="state.bgBlur" @input="onInput('bgBlur', $event)" class="flex-1" />
          <span class="vb">{{ state.bgBlur }}</span>
        </div>
      </div>

      <!-- 文字 + 水印 两列 -->
      <div class="px-3 py-2 space-y-1.5">
        <div class="grid grid-cols-2 gap-3">
          <!-- 左列: 文字 -->
          <div class="space-y-1.5">
            <div class="flex items-center gap-1.5 mb-0.5">
              <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              <span class="text-sm font-bold text-stone-700 dark:text-stone-200">文字</span>
            </div>
            <textarea v-model="state.text" @input="onInput('text', $event)" placeholder="输入标题" rows="1"
              class="ctrl w-full resize-none !py-1 !leading-tight"></textarea>
            <div class="flex items-center gap-1">
              <label class="lbl">大小</label>
              <input type="range" min="100" max="300" v-model="state.textSize" @input="onInput('textSize', $event)" class="flex-1" />
              <span class="vb">{{ state.textSize }}</span>
            </div>
            <div class="flex items-center gap-1">
              <label class="lbl">颜色</label>
              <input type="color" v-model="state.textColor" @input="onInput('textColor', $event)" class="flex-1 h-6" />
            </div>
            <div class="flex items-center gap-1">
              <label class="lbl">立体</label>
              <input type="range" min="0" max="10" step="1" v-model.number="state.text3D" @input="onInput('text3D', $event)" class="flex-1" />
              <span class="vb">{{ state.text3D }}</span>
            </div>
            <div class="flex items-center gap-1">
              <label class="lbl">字体</label>
              <select :value="state.selectedFont" @change="selectFont($event.target.value)"
                class="ctrl flex-1 cursor-pointer !py-1 !text-[11px]"
                :style="{ fontFamily: state.selectedFont }">
                <option v-for="f in defaultConfig.fontOptions" :key="f.value" :value="f.value" :style="{ fontFamily: f.value }">{{ f.label }}</option>
              </select>
            </div>
            <Transition name="fade">
              <div v-if="state.hasMultipleLines" class="flex items-center gap-1">
                <label class="lbl">行高</label>
                <input type="range" min="0.5" max="2" step="0.1" v-model.number="state.lineHeight" @input="onInput('lineHeight', $event)" class="flex-1" />
                <span class="vb">{{ state.lineHeight }}</span>
              </div>
            </Transition>
          </div>
          <!-- 右列: 水印 -->
          <div class="space-y-1.5">
            <div class="flex items-center gap-1.5 mb-0.5">
              <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <span class="text-sm font-bold text-stone-700 dark:text-stone-200">水印</span>
            </div>
            <input type="text" v-model="state.watermark" @input="onInput('watermark', $event)" placeholder="输入水印" class="ctrl w-full" />
            <div class="flex items-center gap-1">
              <label class="lbl">颜色</label>
              <input type="color" v-model="state.watermarkColor" @input="onInput('watermarkColor', $event)" class="flex-1 h-6" />
            </div>
          </div>
        </div>
      </div>

      <!-- 图标样式 -->
      <div v-if="state.squareImageUrl" class="px-3 py-2 space-y-1.5">
        <div class="flex items-center gap-1.5 mb-1">
          <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>
          <span class="text-sm font-bold text-stone-700 dark:text-stone-200">图标样式</span>
        </div>
        <div class="grid grid-cols-2 gap-1.5">
          <div class="flex items-center gap-1">
            <label class="lbl">大小</label>
            <input type="range" min="200" max="500" v-model="state.squareSize" @input="onInput('squareSize', $event)" class="flex-1" />
            <span class="vb">{{ state.squareSize }}</span>
          </div>
          <div class="flex items-center gap-1">
            <label class="lbl">旋转</label>
            <input type="range" min="0" max="360" v-model="state.rotation" @input="onInput('rotation', $event)" class="flex-1" />
            <span class="vb">{{ state.rotation }}°</span>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-1.5">
          <div class="flex items-center gap-1">
            <label class="lbl">阴影</label>
            <input type="range" min="0" max="100" v-model.number="state.shadowStrength" @input="onInput('shadowStrength', $event)" class="flex-1" />
            <span class="vb">{{ state.shadowStrength }}</span>
          </div>
          <div class="flex items-center gap-1">
            <label class="lbl">阴影色</label>
            <input type="color" :value="state.shadowColor.startsWith('rgba') ? '#000000' : state.shadowColor" @input="onInput('shadowColor', $event)" class="flex-1 h-6" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-1.5">
          <div class="flex items-center gap-1">
            <label class="lbl">底色</label>
            <input type="range" min="0" max="20" v-model="state.iconBgSize" @input="onInput('iconBgSize', $event)" class="flex-1" />
            <span class="vb">{{ state.iconBgSize }}</span>
          </div>
          <div class="flex items-center gap-1">
            <label class="lbl">底色</label>
            <input type="color" v-model="state.iconColor" @input="onInput('iconColor', $event)" class="flex-1 h-6" />
          </div>
        </div>
      </div>

      <!-- 导出 -->
      <div class="px-3 py-2 space-y-1.5">
        <div class="flex items-center gap-1.5 mb-1">
          <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          <span class="text-sm font-bold text-stone-700 dark:text-stone-200">导出</span>
        </div>
        <div class="flex gap-1">
          <button v-for="f in formats" :key="f.id" @click="currentFormat = f.id"
            class="flex-1 px-1.5 py-1 rounded text-[11px] font-semibold transition-all"
            :class="currentFormat === f.id ? 'bg-emerald-500 text-white shadow-sm' : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'">
            {{ f.name }}
          </button>
        </div>
        <div class="flex gap-1.5">
          <button @click="doSave" class="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded text-xs font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            保存图片
          </button>
          <button @click="doCopy" class="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded text-xs font-semibold hover:bg-stone-200 dark:hover:bg-stone-700 transition-all">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
            复制
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="px-3 py-1.5 border-t border-stone-200/60 dark:border-stone-700/60 flex items-center gap-2 shrink-0">
      <button @click="$emit('open-settings')" class="p-1.5 bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 transition-all" title="平台尺寸">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
      </button>
      <div class="w-px h-4 bg-stone-200/60 dark:bg-stone-700/60"></div>
      <ImageUploader canvas-id="canvasPreview" />
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { state, updatePreview, saveImage, copyToClipboard, takeSnapshot } from '../composables/useCanvas'
import { useToast } from '../composables/useToast'
import { defaultConfig } from '../config'
import ImageUploader from './ImageUploader.vue'

defineEmits(['open-settings'])
const { addToast } = useToast()

const gradientA = ref('#0c4a6e')
const gradientB = ref('#0ea5e9')

function applyGradient() {
  takeSnapshot()
  state.bgGradient = [gradientA.value, gradientB.value]
  state.bgImageUrl = null
  updatePreview('bgGradient', state.bgGradient)
}
function clearGradient() {
  takeSnapshot()
  state.bgGradient = null
  state.bgColor = gradientA.value
  updatePreview('bgColor', { target: { value: state.bgColor } })
}

const presets = [
  { name: '极简', swatch: '#ffffff', text: '#1c1917', wm: '#d6d3d1', grad: null },
  { name: '暗夜', swatch: '#18181b', text: '#fafafa', wm: '#71717a', grad: null },
  { name: '海洋', swatch: 'linear-gradient(135deg, #0c4a6e, #0ea5e9)', text: '#ffffff', wm: '#7dd3fc', grad: ['#0c4a6e','#0ea5e9'] },
  { name: '日落', swatch: 'linear-gradient(135deg, #f43f5e, #f97316)', text: '#ffffff', wm: '#fecdd3', grad: ['#f43f5e','#f97316'] },
  { name: '森林', swatch: 'linear-gradient(135deg, #14532d, #22c55e)', text: '#ffffff', wm: '#86efac', grad: ['#14532d','#22c55e'] },
  { name: '星空', swatch: 'linear-gradient(135deg, #1e1b4b, #7c3aed)', text: '#ffffff', wm: '#a5b4fc', grad: ['#1e1b4b','#7c3aed'] },
  { name: '暖阳', swatch: 'linear-gradient(135deg, #fef3c7, #f59e0b)', text: '#92400e', wm: '#d97706', grad: ['#fef3c7','#f59e0b'] },
  { name: '薄荷', swatch: 'linear-gradient(135deg, #ecfdf5, #10b981)', text: '#065f46', wm: '#6ee7b7', grad: ['#ecfdf5','#10b981'] },
  { name: '蔷薇', swatch: 'linear-gradient(135deg, #881337, #ec4899)', text: '#ffffff', wm: '#fda4af', grad: ['#881337','#ec4899'] },
  { name: '金秋', swatch: 'linear-gradient(135deg, #92400e, #f59e0b)', text: '#ffffff', wm: '#fcd34d', grad: ['#92400e','#f59e0b'] },
]

const savedPresets = ref(JSON.parse(localStorage.getItem('coverWaveSavedPresets') || '[]'))
function saveSavedPresets() { localStorage.setItem('coverWaveSavedPresets', JSON.stringify(savedPresets.value)) }
function saveCurrentPreset() {
  savedPresets.value.push({
    name: new Date().toLocaleTimeString(), bg: state.bgColor, text: state.textColor, wm: state.watermarkColor,
    grad: state.bgGradient ? [...state.bgGradient] : null,
    swatch: state.bgGradient ? `linear-gradient(135deg, ${state.bgGradient[0]}, ${state.bgGradient[1]})` : state.bgColor
  })
  saveSavedPresets(); addToast('配色已收藏', 'success')
}
function applySavedPreset(sp) { applyPreset(sp) }
function removeSavedPreset(idx) { savedPresets.value.splice(idx, 1); saveSavedPresets() }

function applyPreset(p) {
  takeSnapshot(); state.bgImageUrl = null; state.textColor = p.text; state.watermarkColor = p.wm
  if (p.grad) {
    state.bgGradient = p.grad; gradientA.value = p.grad[0]; gradientB.value = p.grad[1]
    updatePreview('bgGradient', p.grad)
  } else {
    state.bgGradient = null; state.bgColor = p.swatch
    updatePreview('bgColor', { target: { value: p.swatch } })
  }
  updatePreview('textColor', { target: { value: p.text } })
  updatePreview('watermarkColor', { target: { value: p.wm } })
  addToast(`已应用「${p.name}」配色`, 'success')
}

const iconName = ref('')
function loadIcon() {
  if (!iconName.value) { state.squareImageUrl = null; return }
  fetch(`https://api.iconify.design/${iconName.value}.svg`).then(r => r.blob()).then(blob => {
    const file = new File([blob], 'icon.svg', { type: 'image/svg+xml' })
    state.squareImageUrl = URL.createObjectURL(file)
    updatePreview('square', { target: { files: [file] } })
  }).catch(e => addToast('图标加载失败', 'error'))
}

function onBgUpload(e) { takeSnapshot(); updatePreview('bg', e); e.target.value = "" }
function onIconUpload(e) { takeSnapshot(); updatePreview('square', e); e.target.value = "" }
function clearBg() { takeSnapshot(); state.bgImageUrl = null; state.bgGradient = null; updatePreview('bgColor', { target: { value: state.bgColor } }) }
function clearIcon() { takeSnapshot(); state.squareImageUrl = null; state.rotation = 0; updatePreview('bgColor', { target: { value: state.bgColor } }) }
function onInput(type, e) { takeSnapshot(); updatePreview(type, e) }
function selectFont(v) { takeSnapshot(); state.selectedFont = v; updatePreview('font', { target: { value: v } }) }

const formats = [{ id:'png',name:'PNG' },{ id:'jpg',name:'JPG' },{ id:'svg',name:'SVG' },{ id:'ico',name:'ICO' }]
const currentFormat = ref('png')
function doSave() { saveImage(currentFormat.value, 0.92); addToast('图片已保存', 'success') }
async function doCopy() {
  const ok = await copyToClipboard()
  addToast(ok ? '已复制到剪贴板' : '复制失败', ok ? 'success' : 'error')
}
</script>

<style scoped>
.lbl { @apply whitespace-nowrap text-[11px] text-stone-500 dark:text-stone-400 font-medium w-9 shrink-0; }
.vb { @apply text-[10px] font-mono text-stone-500 dark:text-stone-500 bg-stone-100 dark:bg-stone-800 px-1 rounded min-w-[22px] text-center; }
.ctrl { @apply px-2 py-1 border border-stone-200/80 dark:border-stone-700/80 rounded text-xs bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 placeholder:text-stone-400 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500/10 transition-all; }
.btn-xs { @apply px-2 py-1 rounded text-[11px] font-semibold transition-all shadow-sm; }
.fade-enter-active { transition: all .2s ease; }
.fade-leave-active { transition: all .15s ease; }
.fade-enter-from, .fade-leave-to { opacity:0; max-height:0; }
</style>
