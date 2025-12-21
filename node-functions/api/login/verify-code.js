// 文件路径 ./node-functions/api/login/verify-code.js
// 访问路径 https://www.58sb.cn/api/login/verify-code

// 验证微信公众号发送的验证码，完成登录流程

// 使用官方推荐的函数参数格式，通过env访问KV
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
    
    const { code, openid } = requestBody;
    
    if (!code || !openid) {
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
    
    // 从KV获取挑战码
    let challengeDataStr;
    try {
      challengeDataStr = await env.COVER_WAVE_KV.get(`login_challenge_${code}`);
    } catch (kvError) {
      console.error('KV storage error when getting challenge:', kvError);
      return new Response(JSON.stringify({ error: 'Invalid or expired challenge code' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
    
    if (!challengeDataStr) {
      return new Response(JSON.stringify({ error: 'Invalid or expired challenge code' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
    
    const challengeData = JSON.parse(challengeDataStr);
    
    // 检查挑战码是否过期
    if (Date.now() > challengeData.expiresAt) {
      // 删除过期挑战码
      try {
        await env.COVER_WAVE_KV.delete(`login_challenge_${code}`);
      } catch (kvError) {
        console.error('KV storage error when deleting expired challenge:', kvError);
      }
      return new Response(JSON.stringify({ error: 'Challenge code expired' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
    
    // 检查挑战码状态
    if (challengeData.status !== 'pending') {
      return new Response(JSON.stringify({ error: 'Challenge code already used' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
    
    // 生成登录令牌 - 使用时间戳+随机数替代crypto API
    const authToken = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.floor(Math.random() * 10000)}`;
    
    // 登录会话有效期30天
    const authExpiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
    
    // 存储登录会话
    try {
      await env.COVER_WAVE_KV.put(`auth_${authToken}`, JSON.stringify({
        userId: openid, // 使用openid作为用户ID
        expiresAt: authExpiresAt,
        loginMethod: 'wechat_mp'
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
      const userDataStr = await env.COVER_WAVE_KV.get(`user_${openid}`);
      if (!userDataStr) {
        await env.COVER_WAVE_KV.put(`user_${openid}`, JSON.stringify({
          userId: openid,
          createdAt: Date.now(),
          lastLoginAt: Date.now(),
          history: []
        }));
      } else {
        // 更新最后登录时间
        const userData = JSON.parse(userDataStr);
        await env.COVER_WAVE_KV.put(`user_${openid}`, JSON.stringify({
          ...userData,
          lastLoginAt: Date.now()
        }));
      }
    } catch (kvError) {
      console.error('KV storage error when updating user data:', kvError);
      // 继续执行，不影响登录流程
    }
    
    // 更新挑战码状态为成功
    try {
      await env.COVER_WAVE_KV.put(`login_challenge_${code}`, JSON.stringify({
        ...challengeData,
        status: 'success',
        openid: openid,
        authToken: authToken
      }));
    } catch (kvError) {
      console.error('KV storage error when updating challenge status:', kvError);
      // 继续执行，不影响登录流程
    }
    
    return new Response(JSON.stringify({
      success: true,
      authToken,
      userId: openid,
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
    console.error('Error verifying code:', error);
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