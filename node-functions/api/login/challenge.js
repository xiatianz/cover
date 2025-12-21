// 文件路径 ./node-functions/api/login/challenge.js
// 访问路径 https://www.58sb.cn/api/login/challenge

// 生成登录挑战码，用于微信公众号登录

// 使用官方推荐的函数参数格式，通过env访问KV
export default async function onRequest({ request, params, env }) {
  try {
    // 只处理GET请求
    if (request.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
    
    // 生成5位数字挑战码
    const challenge = Math.floor(10000 + Math.random() * 90000).toString();
    
    // 生成唯一的会话ID - 使用时间戳+随机数替代crypto API
    const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 挑战码有效期5分钟
    const expiresAt = Date.now() + 5 * 60 * 1000;
    
    // 检查KV存储是否可用
    if (!env || !env.COVER_WAVE_KV) {
      console.error('KV storage not configured: env.COVER_WAVE_KV is undefined');
      // 即使KV不可用，也返回挑战码，后续登录流程会处理
      return new Response(JSON.stringify({
        success: true,
        challenge: challenge,
        message: 'Challenge code generated successfully (KV storage unavailable, using local storage fallback)',
        kvError: 'KV storage not configured'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
    
    // 存储挑战码到KV
    try {
      await env.COVER_WAVE_KV.put(`login_challenge_${challenge}`, JSON.stringify({
        sessionId,
        expiresAt,
        status: 'pending', // pending, success, failed
        openid: null,
        authToken: null
      }));
    } catch (kvError) {
      console.error('KV storage error:', kvError);
      // 即使KV存储失败，也返回挑战码，后续登录流程会处理
      return new Response(JSON.stringify({
        success: true,
        challenge: challenge,
        message: 'Challenge code generated successfully (KV storage error, using local storage fallback)',
        kvError: kvError.message
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
    
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
    return new Response(JSON.stringify({ 
      error: 'Failed to generate challenge code',
      details: error.message
    }), {
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