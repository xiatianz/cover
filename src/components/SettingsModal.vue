<template>
  <Teleport to="body">
    <div v-if="mounted" 
         class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <!-- 背景遮罩 -->
      <Transition
        appear
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        enter-active-class="transition-opacity duration-300"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
        leave-active-class="transition-opacity duration-300"
      >
        <div v-show="modelValue"
             class="absolute inset-0 bg-black/60" 
             @click="$emit('update:modelValue', false)"
        ></div>
      </Transition>
      
      <!-- 设置容器 -->
      <Transition
        appear
        enter-from-class="opacity-0 translate-y-4 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        enter-active-class="transition-all duration-300 transform"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 translate-y-4 scale-95"
        leave-active-class="transition-all duration-300 transform"
        @after-leave="onAfterLeave"
      >
        <div v-show="modelValue"
             class="relative bg-white rounded-lg shadow-xl w-full max-w-2xl
                    border border-gray-200 p-6 max-h-[90vh] overflow-y-auto"
             @click.stop
        >
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-medium">设置</h3>
            <button @click="$emit('update:modelValue', false)"
                    class="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- 平台尺寸选择 -->
          <div class="space-y-4">
            <h4 class="text-md font-medium text-gray-900 mb-4">选择平台尺寸</h4>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div
                v-for="platform in platformSizes"
                :key="platform.id"
                @click="selectPlatformInstant(platform)"
                class="p-3 border-2 rounded-lg cursor-pointer transition-all hover:shadow-sm text-center"
                :class="selectedPlatform?.id === platform.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'"
              >
                <div class="text-lg mb-1">{{ platform.icon }}</div>
                <h5 class="font-medium text-gray-900 text-sm">{{ platform.name }}</h5>
                <p class="text-xs text-gray-500">{{ platform.width }}×{{ platform.height }}</p>
                <div v-if="selectedPlatform?.id === platform.id" class="text-blue-500 mt-1">
                  <svg class="w-4 h-4 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>
            <div class="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
              <p class="mb-1"><strong>提示：</strong>点击即可应用尺寸</p>
              <p v-if="selectedPlatform" class="text-blue-600">
                当前选择：{{ selectedPlatform.name }} ({{ selectedPlatform.width }}×{{ selectedPlatform.height }})
              </p>
            </div>
          </div>

          <!-- 关闭按钮 -->
          <div class="flex justify-end mt-6 pt-4 border-t border-gray-200">
            <button
              @click="$emit('update:modelValue', false)"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              完成
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: 'SettingsModal',
  props: {
    modelValue: Boolean
  },
  emits: ['update:modelValue', 'platform-changed', 'formats-changed'],
  data() {
    return {
      mounted: false,
      selectedPlatform: null,
      platformSizes: [
        {
          id: 'wechat-cover',
          name: '公众号封面',
          icon: '📱',
          width: 900,
          height: 500,
          description: '微信公众号文章封面图'
        },
        {
          id: 'miniprogram-avatar',
          name: '小程序头像',
          icon: '🎯',
          width: 144,
          height: 144,
          description: '微信小程序头像'
        },
        {
          id: 'blog-banner',
          name: '博客横幅',
          icon: '📝',
          width: 1200,
          height: 630,
          description: '博客文章横幅图片'
        },
        {
          id: 'weibo-post',
          name: '微博配图',
          icon: '🐦',
          width: 690,
          height: 920,
          description: '微博单图配图'
        },
        {
          id: 'zhihu-column',
          name: '知乎专栏封面',
          icon: '📚',
          width: 1200,
          height: 675,
          description: '知乎专栏文章封面'
        },
        {
          id: 'ppt-cover',
          name: 'PPT封面',
          icon: '📊',
          width: 1920,
          height: 1080,
          description: '演示文稿封面'
        },
        {
          id: 'knowledge-card',
          name: '知识卡片',
          icon: '🎓',
          width: 800,
          height: 1000,
          description: '知识卡片视觉增强'
        },
        {
          id: 'article-thumb',
          name: '文章目录图',
          icon: '📄',
          width: 400,
          height: 300,
          description: '文章缩略图'
        },
        {
          id: 'column-banner',
          name: '栏目图',
          icon: '🏷️',
          width: 1080,
          height: 608,
          description: '栏目快速生成'
        },
        {
          id: 'social-square',
          name: '社交媒体方图',
          icon: '📷',
          width: 1080,
          height: 1080,
          description: '朋友圈/Instagram'
        },
        {
          id: 'square-500',
          name: '方形图标',
          icon: '⬜',
          width: 500,
          height: 500,
          description: '通用方形图标'
        },
        {
          id: 'youtube-thumbnail',
          name: 'YouTube缩略图',
          icon: '🎬',
          width: 1280,
          height: 720,
          description: 'YouTube视频缩略图'
        },
        {
          id: 'story-vertical',
          name: '竖版故事',
          icon: '📖',
          width: 1080,
          height: 1920,
          description: 'Stories模板'
        },
        {
          id: 'twitter-header',
          name: 'Twitter横幅',
          icon: '🐦',
          width: 1500,
          height: 500,
          description: 'Twitter个人资料横幅'
        },
        {
          id: 'linkedin-post',
          name: 'LinkedIn帖子',
          icon: '💼',
          width: 1200,
          height: 627,
          description: 'LinkedIn分享图片'
        },
        {
          id: 'custom',
          name: '自定义尺寸',
          icon: '⚙️',
          width: 1000,
          height: 500,
          description: '当前画布尺寸'
        }
      ]
    }
  },
  watch: {
    modelValue(val) {
      if (val) {
        this.mounted = true
        // 设置默认选中自定义尺寸
        if (!this.selectedPlatform) {
          this.selectedPlatform = this.platformSizes.find(p => p.id === 'custom')
        }
      }
    }
  },
  methods: {
    onAfterLeave() {
      this.mounted = false
    },
    selectPlatform(platform) {
      this.selectedPlatform = platform
    },
    selectPlatformInstant(platform) {
      this.selectedPlatform = platform
      // 立即应用平台尺寸变更
      this.$emit('platform-changed', platform)
    },
    applySettings() {
      // 发送平台尺寸变更事件
      if (this.selectedPlatform) {
        this.$emit('platform-changed', this.selectedPlatform)
      }
      
      // 发送格式变更事件
      this.$emit('formats-changed', {
        formats: this.selectedFormats,
        jpgQuality: this.jpgQuality
      })
      
      // 关闭模态框
      this.$emit('update:modelValue', false)
    }
  }
}
</script>
