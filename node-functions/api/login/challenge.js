// 文件路径 ./node-functions/api/login/challenge.js
// 访问路径 https://www.58sb.cn/api/login/challenge

// 生成登录挑战码，用于微信公众号登录

export default async function onRequestGet(context) {
  try {
    // 生成5位数字挑战码
    const challenge = Math.floor(10000 + Math.random() * 90000).toString();
    
    // 生成唯一的会话ID
    const sessionId = crypto.randomUUID();
    
    // 挑战码有效期5分钟
    const expiresAt = Date.now() + 5 * 60 * 1000;
    
    // 存储挑战码到KV
    await context.env.COVER_WAVE_KV.put(`login_challenge_${challenge}`, JSON.stringify({
      sessionId,
      expiresAt,
      status: 'pending', // pending, success, failed
      openid: null,
      authToken: null
    }));
    
    return new Response(JSON.stringify({
      success: true,
      challenge: challenge,
      message: 'Challenge code generated successfully'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  } catch (error) {
    console.error('Error generating challenge:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate challenge code' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}