// 文件路径 ./node-functions/api/login/wechat/verify-code.js
// 访问路径 https://www.58sb.cn/api/login/wechat/verify-code

// 验证微信公众号登录验证码并生成登录会话

export default async function onRequestPost(context) {
  try {
    // 解析请求体
    const { sessionId, code } = await context.request.json();
    
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
    const codeDataStr = await context.env.COVER_WAVE_KV.get(`wechat_code_${sessionId}`);
    
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
      await context.env.COVER_WAVE_KV.delete(`wechat_code_${sessionId}`);
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
    await context.env.COVER_WAVE_KV.put(`wechat_code_${sessionId}`, JSON.stringify({
      ...codeData,
      used: true
    }));
    
    // 生成登录令牌
    const authToken = crypto.randomUUID();
    
    // 生成用户ID（基于sessionId的哈希，实际生产环境中应该使用用户的OpenID）
    const userId = await hashSessionId(sessionId);
    
    // 登录会话有效期30天
    const authExpiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
    
    // 存储登录会话
    await context.env.COVER_WAVE_KV.put(`auth_${authToken}`, JSON.stringify({
      userId,
      expiresAt: authExpiresAt,
      loginMethod: 'wechat'
    }));
    
    // 确保用户记录存在
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
    return new Response(JSON.stringify({ error: 'Failed to verify code' }), {
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

// 简单的哈希函数
async function hashSessionId(sessionId) {
  const encoder = new TextEncoder();
  const data = encoder.encode(sessionId);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hash));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex.substring(0, 32); // 取前32位作为用户ID
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