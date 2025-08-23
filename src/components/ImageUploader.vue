<template>
  <button v-if="uploadApiUrl" 
          @click="uploadImage"
          :disabled="isUploading"
          class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:bg-gray-400 disabled:cursor-not-allowed">
    {{ isUploading ? '上传中...' : '获取外链' }}
  </button>
  
  <!-- 上传进度和结果弹窗 -->
  <div v-if="showModal" 
       class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
       @click.self="closeModal">
    <div class="bg-white rounded-lg shadow-xl w-[90%] max-w-[600px] max-h-[80vh] overflow-y-auto">
      <!-- 弹窗头部 -->
      <div class="flex items-center justify-between p-4 border-b">
        <h3 class="text-lg font-semibold">{{ isUploading ? '正在上传图片' : (isSuccess ? '上传成功' : '上传失败') }}</h3>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <!-- 弹窗内容 -->
      <div class="p-6">
        <!-- 上传进度 -->
        <div v-if="isUploading" class="text-center">
          <div class="mb-4">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
          <p class="text-gray-600">正在上传到图床，请稍候...</p>
        </div>
        
        <!-- 上传成功 -->
        <div v-else-if="isSuccess" class="space-y-4">
          <div class="text-center text-green-600 mb-4">
            <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <p class="text-lg font-semibold">上传成功！</p>
          </div>
          
          <!-- 图片预览 -->
          <div class="text-center mb-4">
            <img :src="uploadedImageUrl" alt="上传的图片" class="max-w-full max-h-32 mx-auto rounded border">
          </div>
          
          <!-- 多格式链接 -->
          <div class="space-y-3">
            <div v-for="format in linkFormats" :key="format.name" class="border rounded-lg p-3">
              <div class="flex items-center justify-between mb-2">
                <label class="font-medium text-gray-700">{{ format.name }}</label>
                <button @click="copyToClipboard(format.value)" 
                        class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
                  复制
                </button>
              </div>
              <div class="bg-gray-50 p-2 rounded text-sm font-mono break-all">
                {{ format.value }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- 上传失败 -->
        <div v-else class="text-center">
          <div class="text-red-600 mb-4">
            <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L6 6M18 6l-12 12"></path>
            </svg>
            <p class="text-lg font-semibold">上传失败</p>
          </div>
          <p class="text-gray-600">{{ errorMessage }}</p>
          <button @click="uploadImage" 
                  class="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            重试
          </button>
        </div>
      </div>
    </div>
  </div>
  
  <!-- 复制成功提示 -->
  <div v-if="showCopyTip" 
       class="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300">
    复制成功！
  </div>
</template>

<script>
export default {
  name: 'ImageUploader',
  props: {
    canvasId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      uploadApiUrl: 'https://img.58sb.cn/upload',
      uploadToken: 'imgbed_VIPyy1zhsTuWAK2JaQ2eG8HQ84vYTou5',
      showModal: false,
      isUploading: false,
      uploadedImageUrl: '',
      isSuccess: false,
      errorMessage: '',
      showCopyTip: false
    }
  },
  computed: {
    linkFormats() {
      if (!this.uploadedImageUrl) return [];
      
      return [
        {
          name: 'URL',
          value: this.uploadedImageUrl
        },
        {
          name: 'Markdown',
          value: `![image](${this.uploadedImageUrl})`
        },
        {
          name: 'HTML',
          value: `<img src="${this.uploadedImageUrl}" alt="image" />`
        },
        {
          name: 'BBCode',
          value: `[img]${this.uploadedImageUrl}[/img]`
        }
      ];
    }
  },
  methods: {
    uploadImage() {
      if (this.isUploading) return;
      
      this.showModal = true;
      this.isUploading = true;
      this.isSuccess = false;
      this.errorMessage = '';
      this.uploadedImageUrl = '';
      
      const canvas = document.getElementById(this.canvasId);
      canvas.toBlob(blob => {
        const formData = new FormData();
        formData.append('file', blob, 'cover-image.webp');
        
        // 构建请求URL，将token作为authCode参数，并指定上传到img文件夹
        const uploadUrl = `${this.uploadApiUrl}?authCode=${this.uploadToken}&returnFormat=full&uploadFolder=img`;
        
        fetch(uploadUrl, {
          method: 'POST',
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          this.isUploading = false;
          if (data && data.length > 0 && data[0].src) {
            // 如果返回格式是full，直接使用；否则需要拼接域名
            const imageUrl = data[0].src.startsWith('http') 
              ? data[0].src 
              : `https://img.58sb.cn${data[0].src}`;
            this.uploadedImageUrl = imageUrl;
            this.isSuccess = true;
          } else {
            this.isSuccess = false;
            this.errorMessage = '响应格式错误，请检查API配置';
          }
        })
        .catch(error => {
          this.isUploading = false;
          this.isSuccess = false;
          this.errorMessage = error.message || '网络错误，请重试';
          console.error('上传图片时出错:', error);
        });
      }, 'image/webp');
    },
    
    closeModal() {
      this.showModal = false;
      this.isUploading = false;
    },
    
    async copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text);
        this.showCopyTip = true;
        setTimeout(() => {
          this.showCopyTip = false;
        }, 2000);
      } catch (err) {
        console.error('复制失败:', err);
        // 降级方案
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        this.showCopyTip = true;
        setTimeout(() => {
          this.showCopyTip = false;
        }, 2000);
      }
    }
  }
}
</script>