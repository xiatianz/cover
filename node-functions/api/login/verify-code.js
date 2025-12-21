// 文件路径 ./node-functions/api/login/verify-code.js
// 访问路径 https://www.58sb.cn/api/login/verify-code

// 验证微信公众号发送的验证码，完成登录流程

export default async function onRequestPost(context) {
  try {
    // 解析请求体
    const { code, openid } = await context.request.json();
    
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
    const challengeDataStr = await context.env.COVER_WAVE_KV.get(`login_challenge_${code}`);
    
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
      await context.env.COVER_WAVE_KV.delete(`login_challenge_${code}`);
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
    
    // 生成登录令牌
    const authToken = crypto.randomUUID();
    
    // 登录会话有效期30天
    const authExpiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
    
    // 存储登录会话
    await context.env.COVER_WAVE_KV.put(`auth_${authToken}`, JSON.stringify({
      userId: openid, // 使用openid作为用户ID
      expiresAt: authExpiresAt,
      loginMethod: 'wechat_mp'
    }));
    
    // 确保用户记录存在
    const userDataStr = await context.env.COVER_WAVE_KV.get(`user_${openid}`);
    if (!userDataStr) {
      await context.env.COVER_WAVE_KV.put(`user_${openid}`, JSON.stringify({
        userId: openid,
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
        history: []
      }));
    } else {
      // 更新最后登录时间
      const userData = JSON.parse(userDataStr);
      await context.env.COVER_WAVE_KV.put(`user_${openid}`, JSON.stringify({
        ...userData,
        lastLoginAt: Date.now()
      }));
    }
    
    // 更新挑战码状态为成功
    await context.env.COVER_WAVE_KV.put(`login_challenge_${code}`, JSON.stringify({
      ...challengeData,
      status: 'success',
      openid: openid,
      authToken: authToken
    }));
    
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