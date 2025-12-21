<template>
  <div class="flex gap-2">
    <button v-if="uploadApiUrl" 
            @click="uploadImage"
            :disabled="isUploading"
            class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:bg-gray-400 disabled:cursor-not-allowed">
      {{ isUploading ? '上传中...' : '获取外链' }}
    </button>
    
    <button @click="showHistory = true"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
      历史记录
    </button>
  </div>
  
  <!-- 上传进度和结果弹窗 -->
  <div v-if="showModal" 
       class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
       @click.self="closeModal">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-[500px] max-h-[85vh] overflow-y-auto">
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
  
  <!-- 历史记录弹窗 -->
  <div v-if="showHistory" 
       class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="showHistory = false">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-[600px] max-h-[85vh] overflow-y-auto">
      <!-- 弹窗头部 -->
      <div class="flex items-center justify-between p-4 border-b">
        <h3 class="text-lg font-semibold">历史记录</h3>
        <div class="flex gap-2">
          <button @click="clearHistory" 
                  class="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors">
            清空
          </button>
          <button @click="showHistory = false" 
                  class="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors">
            关闭
          </button>
        </div>
      </div>
      
      <!-- 弹窗内容 -->
      <div class="p-4">
        <div v-if="history.length === 0" class="text-center py-8 text-gray-500">
          暂无历史记录
        </div>
        
        <div v-else class="space-y-3">
          <div v-for="(item, index) in history" :key="index" 
               class="border rounded-lg p-3">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-500">{{ item.timestamp }}</span>
              <button @click="removeHistoryItem(index)" 
                      class="text-red-500 hover:text-red-700 text-sm">
                删除
              </button>
            </div>
            
            <div class="space-y-2">
              <div class="text-sm font-medium">
                {{ item.name }}
              </div>
              <div class="bg-gray-50 p-2 rounded text-xs font-mono break-all overflow-x-auto">
                {{ item.url }}
              </div>
              
              <div class="flex gap-2 flex-wrap">
                <button @click="copyUrlToClipboard(item.url)" 
                        class="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors">
                  复制链接
                </button>
                <button @click="copyMarkdownToClipboard(item.url)" 
                        class="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors">
                  复制Markdown
                </button>
                <button @click="copyHtmlToClipboard(item.url)" 
                        class="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors">
                  复制HTML
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageUploader',
  props: {
    canvasId: {
      type: String,
      required: true
    },
    currentFormat: {
      type: String,
      default: 'png'
    },
    jpgQuality: {
      type: Number,
      default: 0.9
    }
  },
  data() {
    return {
      uploadApiUrl: '/api/upload',
      imageDomain: import.meta.env.VITE_APP_IMAGE_DOMAIN || 'https://img.58sb.cn',
      uploadToken: import.meta.env.VITE_APP_UPLOAD_TOKEN,
      showModal: false,
      showHistory: false,
      isUploading: false,
      uploadedImageUrl: '',
      isSuccess: false,
      errorMessage: '',
      showCopyTip: false,
      formatUrls: {},
      history: []
    }
  },
  computed: {
    linkFormats() {
      if (!this.uploadedImageUrl && Object.keys(this.formatUrls).length === 0) return [];
      
      const formats = [];
      const currentUrl = this.formatUrls[this.currentFormat] || this.uploadedImageUrl;
      
      if (currentUrl) {
        const formatName = this.currentFormat.toUpperCase();
        
        formats.push({
          name: `${formatName} - 直链`,
          value: currentUrl
        });
        
        formats.push({
          name: `${formatName} - Markdown`,
          value: `![image](${currentUrl})`
        });
        
        formats.push({
          name: `${formatName} - HTML`,
          value: `<img src="${currentUrl}" alt="image" />`
        });
        
        formats.push({
          name: `${formatName} - BBCode`,
          value: `[img]${currentUrl}[/img]`
        });
      }
      
      return formats;
    }
  },
  
  mounted() {
    // 加载历史记录
    this.loadHistory();
    
    // 监听全局登录/登出事件
    window.addEventListener('userLoggedIn', this.handleUserLoggedIn);
    window.addEventListener('userLoggedOut', this.handleUserLoggedOut);
  },
  
  beforeUnmount() {
    window.removeEventListener('userLoggedIn', this.handleUserLoggedIn);
    window.removeEventListener('userLoggedOut', this.handleUserLoggedOut);
  },
  
  methods: {
    // 检查用户是否登录
    isUserLoggedIn() {
      return !!localStorage.getItem('coverWaveAuthToken');
    },
    
    // 获取认证令牌
    getAuthToken() {
      return localStorage.getItem('coverWaveAuthToken');
    },
    
    // 加载历史记录
    async loadHistory() {
      try {
        if (this.isUserLoggedIn()) {
          // 从KV存储加载历史记录
          await this.loadHistoryFromKV();
        } else {
          // 从本地存储加载历史记录
          const savedHistory = localStorage.getItem('coverWaveUploadHistory');
          if (savedHistory) {
            this.history = JSON.parse(savedHistory);
          }
        }
      } catch (error) {
        console.error('Failed to load history:', error);
        this.history = [];
      }
    },
    
    // 从KV存储加载历史记录
    async loadHistoryFromKV() {
      try {
        const authToken = this.getAuthToken();
        if (!authToken) return;
        
        const response = await fetch('/api/history', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        const data = await response.json();
        if (data.success) {
          this.history = data.history;
          // 同时保存到本地，作为备份
          this.saveHistoryToLocal();
        }
      } catch (error) {
        console.error('Failed to load history from KV:', error);
        // 加载失败时，回退到本地存储
        const savedHistory = localStorage.getItem('coverWaveUploadHistory');
        if (savedHistory) {
          this.history = JSON.parse(savedHistory);
        }
      }
    },
    
    // 保存历史记录到本地
    saveHistoryToLocal() {
      try {
        localStorage.setItem('coverWaveUploadHistory', JSON.stringify(this.history));
      } catch (error) {
        console.error('Failed to save history to local:', error);
      }
    },
    
    // 保存历史记录到KV存储
    async saveHistoryToKV() {
      try {
        if (!this.isUserLoggedIn()) return;
        
        const authToken = this.getAuthToken();
        if (!authToken) return;
        
        // KV存储API会处理整个历史记录的更新
        // 这里只需要确保本地历史记录是最新的
        await this.loadHistoryFromKV();
      } catch (error) {
        console.error('Failed to sync history to KV:', error);
      }
    },
    
    // 添加历史记录
    async addHistory(url, name) {
      const timestamp = new Date().toLocaleString();
      const historyItem = {
        url,
        name,
        timestamp
      };
      
      // 添加到历史记录开头
      this.history.unshift(historyItem);
      
      // 限制历史记录数量，最多保存50条
      if (this.history.length > 50) {
        this.history = this.history.slice(0, 50);
      }
      
      // 保存到本地存储
      this.saveHistoryToLocal();
      
      // 如果用户已登录，同步到KV存储
      if (this.isUserLoggedIn()) {
        try {
          const authToken = this.getAuthToken();
          await fetch('/api/history', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(historyItem)
          });
        } catch (error) {
          console.error('Failed to add history to KV:', error);
        }
      }
    },
    
    // 删除单个历史记录
    async removeHistoryItem(index) {
      this.history.splice(index, 1);
      this.saveHistoryToLocal();
      
      // 如果用户已登录，同步到KV存储
      if (this.isUserLoggedIn()) {
        await this.saveHistoryToKV();
      }
    },
    
    // 清空历史记录
    async clearHistory() {
      if (confirm('确定要清空所有历史记录吗？')) {
        this.history = [];
        this.saveHistoryToLocal();
        
        // 如果用户已登录，同步到KV存储
        if (this.isUserLoggedIn()) {
          try {
            const authToken = this.getAuthToken();
            await fetch('/api/history', {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${authToken}`
              }
            });
          } catch (error) {
            console.error('Failed to clear history from KV:', error);
          }
        }
      }
    },
    
    // 处理用户登录事件
    async handleUserLoggedIn() {
      // 登录后，从KV同步历史记录
      await this.loadHistoryFromKV();
    },
    
    // 处理用户登出事件
    handleUserLoggedOut() {
      // 登出后，确保使用本地存储的历史记录
      const savedHistory = localStorage.getItem('coverWaveUploadHistory');
      if (savedHistory) {
        this.history = JSON.parse(savedHistory);
      }
    },
    
    // 复制不同格式的链接到剪贴板
    copyUrlToClipboard(url) {
      this.copyToClipboard(url);
    },
    
    copyMarkdownToClipboard(url) {
      this.copyToClipboard(`![image](${url})`);
    },
    
    copyHtmlToClipboard(url) {
      this.copyToClipboard(`<img src="${url}" alt="image" />`);
    },
    
    uploadImage() {
      if (this.isUploading) return;
      
      this.showModal = true;
      this.isUploading = true;
      this.isSuccess = false;
      this.errorMessage = '';
      this.uploadedImageUrl = '';
      this.formatUrls = {};
      
      const canvas = document.getElementById(this.canvasId);
      
      // 只上传当前选择的格式
      this.uploadSingleFormat(canvas);
    },
    
    async uploadSingleFormat(canvas) {
      // 根据当前选择的格式确定上传类型
      const formatMap = {
        'png': { type: 'image/png', ext: 'png', name: 'PNG' },
        'jpg': { type: 'image/jpeg', ext: 'jpg', name: 'JPG' },
        'svg': { type: 'image/png', ext: 'png', name: 'PNG' }, // SVG以PNG格式上传
        'ico': { type: 'image/png', ext: 'png', name: 'PNG' }  // ICO以PNG格式上传
      };
      
      const format = formatMap[this.currentFormat] || formatMap['png'];
      
      try {
        const result = await this.uploadFormat(canvas, format);
        
        this.isUploading = false;
        
        if (result.success) {
          this.isSuccess = true;
          this.uploadedImageUrl = result.url;
          // 只存储当前格式的URL
          this.formatUrls = {};
          this.formatUrls[this.currentFormat] = result.url;
          
          // 添加到历史记录
          this.addHistory(result.url, `${result.name}格式图片`);
        } else {
          this.isSuccess = false;
          this.errorMessage = result.error || '上传失败，请重试';
        }
      } catch (error) {
        this.isUploading = false;
        this.isSuccess = false;
        this.errorMessage = error.message || '上传过程中出现错误';
      }
    },

    async uploadMultipleFormats(canvas) {
      const formats = [
        { type: 'image/png', ext: 'png', name: 'PNG' },
        { type: 'image/jpeg', ext: 'jpg', name: 'JPG' },
        { type: 'image/webp', ext: 'webp', name: 'WebP' }
      ];
      
      try {
        const uploadPromises = formats.map(format => this.uploadFormat(canvas, format));
        const results = await Promise.all(uploadPromises);
        
        this.isUploading = false;
        
        // 检查是否有成功的上传
        const successResults = results.filter(result => result.success);
        if (successResults.length > 0) {
          this.isSuccess = true;
          this.uploadedImageUrl = successResults[0].url; // 主要显示第一个成功的
          
          // 存储所有格式的URL
          successResults.forEach(result => {
            this.formatUrls[result.format] = result.url;
          });
        } else {
          this.isSuccess = false;
          this.errorMessage = '所有格式上传失败，请重试';
        }
      } catch (error) {
        this.isUploading = false;
        this.isSuccess = false;
        this.errorMessage = error.message || '上传过程中出现错误';
      }
    },
    
    uploadFormat(canvas, format) {
      return new Promise((resolve) => {
        const quality = format.type === 'image/jpeg' ? this.jpgQuality : undefined;
        
        // 对于PNG格式，确保保持透明背景
        if (format.type === 'image/png') {
          // 创建一个新的canvas来确保透明背景
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d', { alpha: true });
          tempCanvas.width = canvas.width;
          tempCanvas.height = canvas.height;
          
          // 不设置背景色，保持透明
          tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
          tempCtx.drawImage(canvas, 0, 0);
          
          tempCanvas.toBlob(blob => {
            const formData = new FormData();
            formData.append('file', blob, `cover-image.${format.ext}`);
            
            const uploadUrl = '/api/upload';
            
            fetch(uploadUrl, {
              method: 'POST',
              body: formData
            })
            .then(response => {
              return response.text();
            })
            .then(text => {
              // 检查是否为 "Unauthorized" 字符串
              if (text.trim() === 'Unauthorized') {
                resolve({
                  success: false,
                  format: format.ext,
                  name: format.name,
                  error: '认证失败: 上传token无效或已过期'
                });
                return;
              }
              
              // 尝试解析JSON
              try {
                const data = JSON.parse(text);
                if (Array.isArray(data) && data.length > 0 && data[0].src) {
                  const imageUrl = data[0].src.startsWith('http') 
                    ? data[0].src 
                    : `${this.imageDomain}${data[0].src}`;
                  resolve({
                    success: true,
                    url: imageUrl,
                    format: format.ext,
                    name: format.name
                  });
                } else {
                  resolve({
                    success: false,
                    format: format.ext,
                    name: format.name,
                    error: `响应格式错误: ${JSON.stringify(text)}`
                  });
                }
              } catch (e) {
                resolve({
                  success: false,
                  format: format.ext,
                  name: format.name,
                  error: `服务器返回无效响应: ${text}`
                });
              }
            })
            .catch(error => {
              resolve({
                success: false,
                error: `网络请求失败: ${error.message || '未知错误'}`
              });
            });
          }, format.type, quality);
        } else {
          // 对于其他格式，同样使用代理路径
          canvas.toBlob(blob => {
            const formData = new FormData();
            formData.append('file', blob, `cover-image.${format.ext}`);
            
            const uploadUrl = this.uploadApiUrl;
            
            fetch(uploadUrl, {
              method: 'POST',
              body: formData
            })
            .then(response => {
              return response.text();
            })
            .then(text => {
              // 检查是否为 "Unauthorized" 字符串
              if (text.trim() === 'Unauthorized') {
                resolve({
                  success: false,
                  format: format.ext,
                  name: format.name,
                  error: '认证失败: 上传token无效或已过期'
                });
                return;
              }
              
              // 尝试解析JSON
              try {
                const data = JSON.parse(text);
                if (Array.isArray(data) && data.length > 0 && data[0].src) {
                  // 检查响应中的URL是否已经是完整URL，如果不是则拼接展示域名
                  let imageUrl = data[0].src;
                  if (!imageUrl.startsWith('http')) {
                    // 检查是否已经有斜杠开头
                    if (imageUrl.startsWith('/')) {
                      imageUrl = `${this.imageDomain}${imageUrl}`;
                    } else {
                      imageUrl = `${this.imageDomain}/${imageUrl}`;
                    }
                  } else {
                    // 如果已经是完整URL，使用展示域名替换原始域名
                    try {
                      const url = new URL(imageUrl);
                      const origin = url.origin;
                      imageUrl = imageUrl.replace(origin, this.imageDomain);
                    } catch (e) {
                      console.error('Invalid URL:', imageUrl, e);
                    }
                  }
                  resolve({
                    success: true,
                    url: imageUrl,
                    format: format.ext,
                    name: format.name
                  });
                } else {
                  resolve({
                    success: false,
                    format: format.ext,
                    name: format.name,
                    error: `响应格式错误: ${JSON.stringify(text)}`
                  });
                }
              } catch (e) {
                resolve({
                  success: false,
                  format: format.ext,
                  name: format.name,
                  error: `服务器返回无效响应: ${text}`
                });
              }
            })
            .catch(error => {
              resolve({
                success: false,
                error: `网络请求失败: ${error.message || '未知错误'}`
              });
            });
          }, format.type, quality);
        }
      });
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