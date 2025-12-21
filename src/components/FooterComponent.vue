<template>
  <footer class="sm:mt-12 mb-2 text-center text-xs sm:text-sm">
    <div class="flex flex-wrap justify-center gap-x-2 gap-y-1">
      <span>富强</span>
      <span>民主</span>
      <span>文明</span>
      <span>和谐</span>
      <span>自由</span>
      <span>平等</span>
      <span>公正</span>
      <span>法治</span>
      <span>爱国</span>
      <span>敬业</span>
      <span>诚信</span>
      <span>友善</span>
    </div>
    <div class="mt-2 space-x-2">
      <span>© 2024</span>
      <a href="https://ehon.cn" 
         target="_blank"
         class="font-bold text-green-600 hover:text-gray-600 transition-colors">Cover-Wave</a>
      <div class="inline-flex items-center gap-1">
        <a v-if="icpNumber"
           href="https://beian.miit.gov.cn/" 
           target="_blank"
           class="font-bold text-green-600 hover:text-gray-600 transition-colors">{{ icpNumber }}</a>
        <a v-if="policeNumber"
           :href="`https://www.beian.gov.cn/portal/registerSystemInfo?recordcode=${policeNumber.match(/\d+/)[0]}`"
           target="_blank"
           class="font-bold text-green-600 hover:text-gray-600 transition-colors flex items-center gap-1">
          <img :src="policeIconPath" alt="公安备案图标" class="w-4 h-4 inline-block">
          {{ policeNumber }}
        </a>
      </div>
      <button class="text-pink-500 font-bold" @click="toggleTips">小提示</button>
      <button class="text-blue-500 font-bold" @click="toggleIconTutorial">图标教程</button>
      <span class="text-red-500 font-bold">访问统计：<span class="text-red-600 font-bold">{{ visitCount }}</span></span>
    </div>
    
    <!-- 小提示弹窗 -->
    <div class="fixed top-0 left-1/2 w-[90%] max-w-[600px] max-h-[82px] p-[10px] mt-[10px] bg-white text-[#333] rounded-[10px] shadow-[0_4px_8px_#0000001a] z-100 flex flex-col justify-center items-center text-center overflow-hidden transition-all duration-300 ease-in-out"
         :style="{
           opacity: showTipsPopup ? 1 : 0,
           visibility: showTipsPopup ? 'visible' : 'hidden',
           transform: `translate(-50%) translateY(${showTipsPopup ? '0' : '-20px'})`
         }"
    >
      <div class="flex flex-col text-base items-center justify-center">
        <span>为避免性能问题，建议不要连续做图</span>
        <span>建议经常<a href="/" class="text-green-600 hover:text-gray-800 transition-colors">刷新页面</a>优化性能</span>
        <span class="text-red-500 font-bold">重要提示：请确保您的浏览器和设备性能良好</span>
      </div>
    </div>

    <!-- 图标教程弹窗 -->
    <div v-if="showIconTutorial" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="showIconTutorial = false">
      <div class="bg-white rounded-lg p-6 max-w-2xl mx-4 max-h-[80vh] overflow-y-auto" @click.stop>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">图标使用教程</h3>
          <button @click="showIconTutorial = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="space-y-4">
          <div class="bg-gray-50 rounded-lg p-4">
            <h4 class="font-medium text-gray-800 mb-2">🎯 获取图标的方法</h4>
            <div class="space-y-2 text-sm text-gray-600">
              <p><strong>方法一：</strong>点进入 <span class="bg-red-100 text-red-700 px-1 rounded">图标库</span> 之后复制图标代码，输入图标名称</p>
              <p><strong>方法二：</strong>使用 Iconify、Feather Icons、Heroicons 等图标库</p>
              <p><strong>方法三：</strong>上传本地 PNG、SVG 格式的图标文件</p>
            </div>
          </div>

          <div class="bg-gray-50 rounded-lg p-4">
            <h4 class="font-medium text-gray-800 mb-2">📝 图标库使用步骤</h4>
            <div class="space-y-2 text-sm text-gray-600">
              <div class="flex items-center gap-2">
                <span class="bg-blue-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">1</span>
                <span>访问图标库网站（如 iconify.design）</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="bg-blue-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">2</span>
                <span>搜索并选择喜欢的图标</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="bg-blue-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">3</span>
                <span>复制图标代码（如：logos:chrome）</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="bg-blue-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">4</span>
                <span>在本工具中输入图标名称</span>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 rounded-lg p-4">
            <h4 class="font-medium text-gray-800 mb-2">🎨 图标调整功能</h4>
            <div class="space-y-2 text-sm text-gray-600">
              <p>• <strong>拖拽移动：</strong>点击图标可以拖拽调整位置</p>
              <p>• <strong>尺寸调整：</strong>使用右侧滑块调整图标大小</p>
              <p>• <strong>颜色修改：</strong>可以修改图标颜色和背景色</p>
              <p>• <strong>旋转角度：</strong>支持360度旋转调整</p>
            </div>
          </div>

          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 class="font-medium text-yellow-800 mb-2">💡 推荐图标库</h4>
            <div class="space-y-1 text-sm text-yellow-700">
              <p>• <strong>Iconify：</strong>iconify.design（最全面）</p>
              <p>• <strong>Feather Icons：</strong>feathericons.com（简洁风格）</p>
              <p>• <strong>Heroicons：</strong>heroicons.com（现代设计）</p>
              <p>• <strong>Tabler Icons：</strong>tabler-icons.io（线性图标）</p>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <button 
            @click="showIconTutorial = false"
            class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
          >
            我知道了
          </button>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  data() {
    return {
      showTipsPopup: false,
      showIconTutorial: false,
      icpNumber: import.meta.env.VITE_APP_ICP_NUMBER,
      policeNumber: import.meta.env.VITE_APP_POLICE_NUMBER,
      policeIconPath: import.meta.env.VITE_APP_POLICE_ICON_PATH || '/tb.png',
      visitCount: 0
    };
  },
  mounted() {
    // 获取访问量
    this.getVisitCount();
    // 更新访问量
    this.updateVisitCount();
  },
  methods: {
    toggleTips() {
      this.showTipsPopup = !this.showTipsPopup;
      if (this.showTipsPopup) {
        setTimeout(() => {
          this.showTipsPopup = false;
        }, 3000);
      }
    },
    toggleIconTutorial() {
      this.showIconTutorial = !this.showIconTutorial;
    },
    async getVisitCount() {
      try {
        const response = await fetch('/api/visit', {
          method: 'GET'
        });
        const data = await response.json();
        if (data.success) {
          this.visitCount = data.visitCount;
        }
      } catch (error) {
        console.error('获取访问量失败:', error);
      }
    },
    async updateVisitCount() {
      try {
        const response = await fetch('/api/visit', {
          method: 'POST'
        });
        const data = await response.json();
        if (data.success) {
          this.visitCount = data.visitCount;
        }
      } catch (error) {
        console.error('更新访问量失败:', error);
      }
    }
  }
};
</script>