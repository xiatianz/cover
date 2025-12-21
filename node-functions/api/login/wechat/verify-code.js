// 文件路径 ./node-functions/api/login/wechat/verify-code.js
// 访问路径 https://www.58sb.cn/api/login/wechat/verify-code

// 验证微信公众号登录验证码并生成登录会话
export default async function onRequest({ request, params, env }) {
  try {
    // 只处理POST请求
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
    
    // 解析请求体
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (parseError) {
      return new Response(JSON.stringify({ error: 'Invalid JSON format' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
    
    const { sessionId, code } = requestBody;
    
    if (!sessionId || !code) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
    
    // 从KV获取验证码
    let codeDataStr;
    try {
      codeDataStr = await env.COVER_WAVE_KV.get(`wechat_code_${sessionId}`);
    } catch (kvError) {
      console.error('KV storage error when getting wechat code:', kvError);
      return new Response(JSON.stringify({ error: 'Invalid session or code expired' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
    
    if (!codeDataStr) {
      return new Response(JSON.stringify({ error: 'Invalid session or code expired' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
    
    const codeData = JSON.parse(codeDataStr);
    
    // 检查验证码是否过期
    if (Date.now() > codeData.expiresAt) {
      // 删除过期验证码
      try {
        await context.env.COVER_WAVE_KV.delete(`wechat_code_${sessionId}`);
      } catch (kvError) {
        console.error('KV storage error when deleting expired code:', kvError);
      }
      return new Response(JSON.stringify({ error: 'Verification code expired' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
    
    // 检查验证码是否已使用
    if (codeData.used) {
      return new Response(JSON.stringify({ error: 'Verification code already used' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
    
    // 检查验证码是否正确
    if (codeData.code !== code) {
      return new Response(JSON.stringify({ error: 'Invalid verification code' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
    
    // 标记验证码为已使用
    try {
      await context.env.COVER_WAVE_KV.put(`wechat_code_${sessionId}`, JSON.stringify({
        ...codeData,
        used: true
      }));
    } catch (kvError) {
      console.error('KV storage error when updating code status:', kvError);
      // 继续执行，不影响登录流程
    }
    
    // 生成登录令牌 - 使用时间戳+随机数替代crypto API
    const authToken = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.floor(Math.random() * 10000)}`;
    
    // 生成用户ID（基于sessionId的哈希，实际生产环境中应该使用用户的OpenID）
    const userId = await hashSessionId(sessionId);
    
    // 登录会话有效期30天
    const authExpiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
    
    // 存储登录会话
    try {
      await context.env.COVER_WAVE_KV.put(`auth_${authToken}`, JSON.stringify({
        userId,
        expiresAt: authExpiresAt,
        loginMethod: 'wechat'
      }));
    } catch (kvError) {
      console.error('KV storage error when storing auth token:', kvError);
      return new Response(JSON.stringify({ error: 'Failed to store authentication token' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
    
    // 确保用户记录存在
    try {
      const userDataStr = await context.env.COVER_WAVE_KV.get(`user_${userId}`);
      if (!userDataStr) {
        await context.env.COVER_WAVE_KV.put(`user_${userId}`, JSON.stringify({
          userId,
          createdAt: Date.now(),
          lastLoginAt: Date.now(),
          history: []
        }));
      } else {
        // 更新最后登录时间
        const userData = JSON.parse(userDataStr);
        await context.env.COVER_WAVE_KV.put(`user_${userId}`, JSON.stringify({
          ...userData,
          lastLoginAt: Date.now()
        }));
      }
    } catch (kvError) {
      console.error('KV storage error when updating user data:', kvError);
      // 继续执行，不影响登录流程
    }
    
    return new Response(JSON.stringify({
      success: true,
      authToken,
      userId,
      message: 'Login successful'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  } catch (error) {
    console.error('Error verifying wechat code:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to verify code',
      details: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }
}

// 简单的哈希函数 - 替代crypto.subtle.digest
function hashSessionId(sessionId) {
  // 使用简单的字符串哈希算法
  let hash = 0;
  for (let i = 0; i < sessionId.length; i++) {
    const char = sessionId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  // 转换为十六进制字符串，确保32位长度
  return Math.abs(hash).toString(16).padStart(32, '0');
}

// 处理OPTIONS请求
export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}