// 文件路径 ./node-functions/api/login/ws.js
// 访问路径 ws://www.58sb.cn/api/login/ws

// 处理登录状态的WebSocket连接，替代轮询

// 导入Supabase客户端
import { loginChallenge } from '../../utils/supabase.js';

export default async function onRequest({ request, params, env }) {
  // 检查是否为WebSocket升级请求
  if (request.headers.get('upgrade') !== 'websocket') {
    return new Response('Expected WebSocket upgrade', { status: 400 });
  }
  
  // 获取查询参数
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  
  if (!code) {
    return new Response('Missing code parameter', { status: 400 });
  }
  
  // 升级为WebSocket连接
  const { socket, response } = Deno.upgradeWebSocket(request);
  
  let checkInterval;
  
  // 监听WebSocket连接建立
  socket.onopen = () => {
    console.log(`WebSocket connection established for code: ${code}`);
    
    // 定期检查登录状态
    checkInterval = setInterval(async () => {
      try {
        // 从Supabase获取挑战码状态
        const { data: challengeData, error: getError } = await loginChallenge.get(code);
        
        if (getError || !challengeData) {
          // 挑战码不存在，可能已过期
          socket.send(JSON.stringify({
            status: 'pending',
            message: 'Challenge code pending (not found in Supabase)',
            supabaseError: getError ? getError.message : 'Challenge code not found in Supabase'
          }));
          return;
        }
        
        // 检查挑战码是否过期
        if (Date.now() > new Date(challengeData.expires_at).getTime()) {
          // 删除过期挑战码
          try {
            await loginChallenge.delete(code);
          } catch (deleteError) {
            console.error('Supabase delete error:', deleteError);
          }
          socket.send(JSON.stringify({
            status: 'expired',
            message: 'Challenge code expired'
          }));
          // 关闭WebSocket连接
          socket.close(1000, 'Challenge code expired');
          clearInterval(checkInterval);
          return;
        }
        
        // 发送当前状态
        socket.send(JSON.stringify({
          success: true,
          status: challengeData.status,
          authToken: challengeData.auth_token || null,
          userId: challengeData.openid || null,
          message: challengeData.status === 'pending' ? 'Waiting for verification' : 'Login completed'
        }));
        
        // 如果登录成功，关闭WebSocket连接
        if (challengeData.status === 'success') {
          clearInterval(checkInterval);
          setTimeout(() => {
            socket.close(1000, 'Login completed');
          }, 1000);
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        socket.send(JSON.stringify({
          status: 'pending',
          message: 'Challenge code pending (Supabase error)',
          supabaseError: error.message
        }));
      }
    }, 1000); // 每秒检查一次
  };
  
  // 监听WebSocket消息
  socket.onmessage = (event) => {
    console.log(`Received message: ${event.data}`);
    // 可以处理前端发送的消息
  };
  
  // 监听WebSocket关闭
  socket.onclose = () => {
    console.log(`WebSocket connection closed for code: ${code}`);
    clearInterval(checkInterval);
  };
  
  // 监听WebSocket错误
  socket.onerror = (error) => {
    console.error(`WebSocket error: ${error.message}`);
    clearInterval(checkInterval);
  };
  
  return response;
}
