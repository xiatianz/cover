<template>
  <Teleport to="body">
    <Transition appear enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60" @click="$emit('update:modelValue', false)"></div>
        <Transition appear enter-active-class="transition-all duration-300 transform" enter-from-class="opacity-0 scale-95 translate-y-4" enter-to-class="opacity-100 scale-100 translate-y-0" leave-active-class="transition-all duration-200 transform" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95 translate-y-4">
          <div v-if="modelValue" class="relative bg-white/95 dark:bg-stone-800/95 backdrop-blur-xl rounded-2xl w-full max-w-xl shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_8px_24px_rgba(0,0,0,0.1)] border border-slate-200/50 dark:border-slate-700/50 max-h-[85vh] overflow-hidden flex flex-col" @click.stop>
            <!-- Header -->
            <div class="flex items-center justify-between p-5 border-b border-slate-100/80 dark:border-slate-700/80">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-indigo-400 flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </div>
                <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100">选择平台尺寸</h3>
              </div>
              <button @click="$emit('update:modelValue', false)" class="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 rounded-lg transition-all duration-150 active:scale-95">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <!-- Grid -->
            <div class="flex-1 overflow-y-auto p-5">
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div v-for="p in platforms" :key="p.id" @click="selectPlatform(p)"
                  class="group p-3.5 border rounded-xl cursor-pointer transition-all duration-150 text-center"
                  :class="selected?.id === p.id ? 'border-slate-400/80 bg-slate-50/50 dark:bg-slate-800/50 shadow-[0_0_0_3px_rgba(71,85,105,0.06)]' : 'border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]'">
                  <div class="text-xl mb-1.5 transition-transform group-hover:scale-110">{{ p.icon }}</div>
                  <h5 class="font-semibold text-slate-700 dark:text-slate-200 text-xs">{{ p.name }}</h5>
                  <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{{ p.width }}×{{ p.height }}</p>
                  <div v-if="selected?.id === p.id" class="text-slate-600 dark:text-slate-300 mt-1.5">
                    <svg class="w-4 h-4 mx-auto" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                  </div>
                </div>
              </div>
              <p v-if="selected" class="mt-4 text-xs text-slate-500 dark:text-slate-400 text-center font-medium">当前：{{ selected.name }} ({{ selected.width }}×{{ selected.height }})</p>
            </div>
            <!-- Footer -->
            <div class="flex justify-end p-4 border-t border-slate-100/80 dark:border-slate-700/80">
              <button @click="$emit('update:modelValue', false)" class="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-b from-indigo-400 to-indigo-500 hover:from-indigo-300 hover:to-indigo-400 rounded-lg shadow-[0_1px_1px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.2)] active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] transition-all duration-150">完成</button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue', 'platform-changed'])

const selected = ref(null)
const platforms = [
  { id:'wechat-cover', name:'公众号封面', icon:'📱', width:900, height:500 },
  { id:'miniprogram-avatar', name:'小程序头像', icon:'🎯', width:144, height:144 },
  { id:'blog-banner', name:'博客横幅', icon:'📝', width:1200, height:630 },
  { id:'weibo-post', name:'微博配图', icon:'🐦', width:690, height:920 },
  { id:'zhihu-column', name:'知乎专栏封面', icon:'📚', width:1200, height:675 },
  { id:'ppt-cover', name:'PPT封面', icon:'📊', width:1920, height:1080 },
  { id:'knowledge-card', name:'知识卡片', icon:'🎓', width:800, height:1000 },
  { id:'article-thumb', name:'文章目录图', icon:'📄', width:400, height:300 },
  { id:'column-banner', name:'栏目图', icon:'🏷️', width:1080, height:608 },
  { id:'social-square', name:'社交媒体方图', icon:'📷', width:1080, height:1080 },
  { id:'square-500', name:'方形图标', icon:'⬜', width:500, height:500 },
  { id:'youtube-thumbnail', name:'YouTube缩略图', icon:'🎬', width:1280, height:720 },
  { id:'story-vertical', name:'竖版故事', icon:'📖', width:1080, height:1920 },
  { id:'twitter-header', name:'Twitter横幅', icon:'🐦', width:1500, height:500 },
  { id:'linkedin-post', name:'LinkedIn帖子', icon:'💼', width:1200, height:627 },
  { id:'custom', name:'自定义尺寸', icon:'⚙️', width:1000, height:500 },
]

watch(() => props.modelValue, v => {
  if (v && !selected.value) selected.value = platforms.find(p => p.id === 'custom')
})

function selectPlatform(p) {
  selected.value = p
  emit('platform-changed', p)
}
</script>
