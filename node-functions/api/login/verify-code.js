// 文件路径 ./node-functions/api/login/verify-code.js
// 访问路径 https://www.58sb.cn/api/login/verify-code

// 验证微信公众号发送的验证码，完成登录流程

// 导入Supabase客户端
import { loginChallenge, authSession, user } from '../../utils/supabase.js';

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
    
    // 从Supabase获取挑战码
    const { data: challengeData, error: challengeError } = await loginChallenge.get(code);
    if (challengeError || !challengeData) {
      console.error('Supabase error when getting challenge:', challengeError);
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
    
    // 检查挑战码是否过期
    if (Date.now() > new Date(challengeData.expires_at).getTime()) {
      // 删除过期挑战码
      try {
        await loginChallenge.delete(code);
      } catch (supabaseError) {
        console.error('Supabase error when deleting expired challenge:', supabaseError);
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
      await authSession.create(authToken, openid, authExpiresAt, 'wechat_mp');
    } catch (supabaseError) {
      console.error('Supabase error when storing auth token:', supabaseError);
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
      const { data: existingUser, error: getUserError } = await user.get(openid);
      if (getUserError || !existingUser) {
        // 创建新用户
        await user.create(openid);
      } else {
        // 更新最后登录时间
        await user.update(openid, {
          last_login_at: new Date()
        });
      }
    } catch (supabaseError) {
      console.error('Supabase error when updating user data:', supabaseError);
      // 继续执行，不影响登录流程
    }
    
    // 更新挑战码状态为成功
    try {
      await loginChallenge.update(code, {
        status: 'success',
        openid: openid,
        auth_token: authToken
      });
    } catch (supabaseError) {
      console.error('Supabase error when updating challenge status:', supabaseError);
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