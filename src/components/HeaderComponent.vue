<template>
    <header class="flex justify-between items-center px-4 py-2 sm:py-4 max-w-[1600px] mx-auto">
        <!-- 左侧：留白 -->
        <div></div>
        
        <!-- 中间：标题 -->
        <div class="flex items-center gap-2">
            <h1 class="text-2xl sm:text-3xl font-bold">{{ title }}</h1>
            <a href="https://ehon.cn" target="_blank" class="text-gray-600 hover:text-gray-800 transition-colors duration-300" title="GitHub">
                <svg height="20" viewBox="0 0 16 16" width="20" class="sm:w-6 sm:h-6">
                    <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                </svg>
            </a>
        </div>
        
        <!-- 右侧：微信登录按钮 -->
        <div class="flex items-center gap-3 ml-6">
            <button v-if="!isLoggedIn" 
                    @click="openLogin"
                    class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                微信登录
            </button>
            <button v-else 
                    @click="logout"
                    class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
                退出登录
            </button>
        </div>
    </header>
    
    <!-- 微信登录弹窗 -->
    <div v-if="showWechatLogin" 
         class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" 
         @click.self="showWechatLogin = false">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-[400px]">
            <!-- 弹窗头部 -->
            <div class="flex items-center justify-between p-4 border-b">
                <h3 class="text-lg font-semibold">微信公众号登录</h3>
                <button @click="cancelLogin" class="text-gray-400 hover:text-gray-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <!-- 弹窗内容 -->
            <div class="p-6 space-y-6">
                <!-- 登录步骤1：生成挑战码 -->
                <div v-if="!challenge" class="text-center">
                    <p class="mb-4 text-gray-600">正在生成登录验证码...</p>
                    <div class="flex justify-center">
                        <div class="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                </div>
                
                <!-- 登录步骤2：显示挑战码和二维码 -->
                <div v-else>
                    <!-- 公众号二维码 -->
                    <div class="text-center">
                        <p class="mb-4 text-gray-600">请扫描下方二维码关注公众号</p>
                        <div class="w-48 h-48 mx-auto bg-white rounded-lg flex items-center justify-center overflow-hidden border">
                            <!-- 实际的公众号二维码图片 -->
                            <img src="/qrcode-wechat.jpg" alt="公众号二维码" class="w-full h-full object-contain">
                        </div>
                        <p class="mt-4 text-sm text-gray-500">公众号名称：Cover Wave</p>
                    </div>
                    
                    <!-- 挑战码显示 -->
                    <div class="bg-green-50 p-4 rounded-lg text-center">
                        <p class="mb-2 text-gray-700 font-medium">登录验证码</p>
                        <p class="text-3xl font-bold text-green-600 mb-3">{{ challenge }}</p>
                        <p class="text-sm text-gray-600">请将上方验证码发送到公众号完成登录</p>
                    </div>
                    
                    <!-- 操作提示 -->
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <p class="text-sm text-gray-700">操作步骤：</p>
                        <ol class="text-sm text-gray-600 mt-2 space-y-1 list-decimal list-inside">
                            <li>扫描二维码关注公众号</li>
                            <li>在公众号对话框发送验证码：<span class="font-medium">{{ challenge }}</span></li>
                            <li>等待系统自动完成登录</li>
                        </ol>
                    </div>
                    
                    <!-- 状态提示 -->
                    <div class="text-center">
                        <div v-if="loginStatus === 'pending'" class="flex items-center justify-center gap-2 text-yellow-600">
                            <div class="w-5 h-5 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                            <p class="text-sm">等待您发送验证码...</p>
                        </div>
                        <div v-else-if="loginStatus === 'success'" class="text-green-600">
                            <p class="text-sm">登录成功！正在跳转...</p>
                        </div>
                        <div v-else-if="loginStatus === 'failed'" class="text-red-600">
                            <p class="text-sm">登录失败，请重试</p>
                        </div>
                        <div v-else-if="loginStatus === 'expired'" class="text-red-600">
                            <p class="text-sm">验证码已过期，请重新获取</p>
                            <button @click="requestChallenge" class="mt-2 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
                                重新获取
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            title: import.meta.env.VITE_APP_TITLE,
            showWechatLogin: false,
            challenge: '',
            loginStatus: 'pending', // pending, success, failed, expired
            isLoggedIn: false,
            authToken: '',
            userId: '',
            pollingInterval: null
        };
    },
    
    mounted() {
        // 检查本地存储中的登录状态
        this.checkLoginStatus();
    },
    
    methods: {
        checkLoginStatus() {
            const authToken = localStorage.getItem('coverWaveAuthToken');
            const userId = localStorage.getItem('coverWaveUserId');
            if (authToken && userId) {
                this.isLoggedIn = true;
                this.authToken = authToken;
                this.userId = userId;
            }
        },
        
        // 打开登录弹窗，开始登录流程
        openLogin() {
            this.showWechatLogin = true;
            this.loginStatus = 'pending';
            this.challenge = '';
            this.requestChallenge();
        },
        
        // 请求登录挑战码
        async requestChallenge() {
            try {
                const response = await fetch('/api/login/challenge', {
                    method: 'GET'
                });
                
                const data = await response.json();
                if (data.success) {
                    this.challenge = data.challenge;
                    // 开始轮询登录状态
                    this.startPollingLoginStatus();
                } else {
                    throw new Error('Failed to generate challenge code');
                }
            } catch (error) {
                console.error('生成挑战码失败:', error);
                alert('生成挑战码失败，请重试');
                this.cancelLogin();
            }
        },
        
        // 开始轮询登录状态
        startPollingLoginStatus() {
            // 清除之前的轮询
            this.stopPollingLoginStatus();
            
            // 每2秒轮询一次
            this.pollingInterval = setInterval(() => {
                this.checkLoginStatusPoll();
            }, 2000);
        },
        
        // 停止轮询登录状态
        stopPollingLoginStatus() {
            if (this.pollingInterval) {
                clearInterval(this.pollingInterval);
                this.pollingInterval = null;
            }
        },
        
        // 检查登录状态（轮询）
        async checkLoginStatusPoll() {
            try {
                const response = await fetch(`/api/login/status?code=${this.challenge}`, {
                    method: 'GET'
                });
                
                const data = await response.json();
                if (data.success) {
                    if (data.status === 'success') {
                        // 登录成功
                        this.loginStatus = 'success';
                        this.stopPollingLoginStatus();
                        this.completeLogin(data.authToken, data.userId);
                    } else if (data.status === 'expired') {
                        // 挑战码过期
                        this.loginStatus = 'expired';
                        this.stopPollingLoginStatus();
                    } else if (data.status === 'failed') {
                        // 登录失败
                        this.loginStatus = 'failed';
                        this.stopPollingLoginStatus();
                    }
                    // 继续轮询 pending 状态
                }
            } catch (error) {
                console.error('检查登录状态失败:', error);
            }
        },
        
        // 完成登录
        completeLogin(authToken, userId) {
            // 保存登录状态
            localStorage.setItem('coverWaveAuthToken', authToken);
            localStorage.setItem('coverWaveUserId', userId);
            
            this.isLoggedIn = true;
            this.authToken = authToken;
            this.userId = userId;
            this.showWechatLogin = false;
            
            // 触发全局登录事件
            window.dispatchEvent(new Event('userLoggedIn'));
            
            // 延迟关闭弹窗，显示登录成功信息
            setTimeout(() => {
                this.showWechatLogin = false;
            }, 1500);
        },
        
        // 取消登录
        cancelLogin() {
            this.stopPollingLoginStatus();
            this.showWechatLogin = false;
            this.challenge = '';
            this.loginStatus = 'pending';
        },
        
        logout() {
            // 清除本地存储
            localStorage.removeItem('coverWaveAuthToken');
            localStorage.removeItem('coverWaveUserId');
            
            // 重置状态
            this.isLoggedIn = false;
            this.authToken = '';
            this.userId = '';
            
            // 触发全局登出事件
            window.dispatchEvent(new Event('userLoggedOut'));
            
            // 关闭登录弹窗（如果打开）
            this.cancelLogin();
        }
    }
};
</script>