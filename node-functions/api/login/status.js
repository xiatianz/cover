// 文件路径 ./node-functions/api/login/status.js
// 访问路径 https://www.58sb.cn/api/login/status

// 查询登录状态，用于前端轮询

export default async function onRequest(context) {
  try {
    // 只处理GET请求
    if (context.request.method !== 'GET') {
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
    
    // 获取查询参数
    const url = new URL(context.request.url);
    const code = url.searchParams.get('code');
    
    if (!code) {
      return new Response(JSON.stringify({ error: 'Missing code parameter' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
    
    // 检查KV存储是否可用
    if (!context.env || !context.env.COVER_WAVE_KV) {
      console.error('KV storage not configured: context.env.COVER_WAVE_KV is undefined');
      return new Response(JSON.stringify({
        success: true,
        status: 'pending', // 返回pending状态，避免显示过期
        message: 'Challenge code pending (KV storage unavailable)',
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
    
    // 从KV获取挑战码状态
    let challengeDataStr;
    const key = `login_challenge_${code}`;
    try {
      challengeDataStr = await context.env.COVER_WAVE_KV.get(key);
      console.log(`KV Get Result for ${key}:`, challengeDataStr);
    } catch (kvError) {
      console.error('KV storage error:', kvError);
      return new Response(JSON.stringify({
        success: true,
        status: 'pending', // 改为pending，避免刚生成就显示过期
        message: 'Challenge code pending (KV storage error)',
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
    
    if (!challengeDataStr) {
      console.log(`Challenge code ${code} not found in KV`);
      return new Response(JSON.stringify({
        success: true,
        status: 'pending', // 改为pending，避免刚生成就显示过期
        message: 'Challenge code pending (not found in KV)',
        kvError: 'Challenge code not found in KV'
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
    
    const challengeData = JSON.parse(challengeDataStr);
    
    // 检查挑战码是否过期
    if (Date.now() > challengeData.expiresAt) {
      try {
        await context.env.COVER_WAVE_KV.delete(`login_challenge_${code}`);
      } catch (kvError) {
        console.error('KV storage error when deleting:', kvError);
      }
      return new Response(JSON.stringify({
        success: true,
        status: 'expired',
        message: 'Challenge code expired'
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
      status: challengeData.status,
      authToken: challengeData.authToken || null,
      userId: challengeData.openid || null,
      message: challengeData.status === 'pending' ? 'Waiting for verification' : 'Login completed'
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
    console.error('Error checking login status:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to check login status',
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