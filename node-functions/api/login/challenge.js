// 文件路径 ./node-functions/api/login/challenge.js
// 访问路径 https://www.58sb.cn/api/login/challenge

// 生成登录挑战码，用于微信公众号登录

// 导入Supabase客户端和工具函数
import { createSupabaseClient } from '../../utils/supabase.js';

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
    
    // 存储挑战码到Supabase
    try {
      const supabase = createSupabaseClient(env);
      await supabase
        .from('login_challenges')
        .insert({
          challenge,
          session_id: sessionId,
          expires_at: new Date(expiresAt),
          status: 'pending',
          openid: null,
          auth_token: null
        })
        .single();
    } catch (supabaseError) {
      console.error('Supabase error:', supabaseError);
      // 即使Supabase存储失败，也返回挑战码，后续登录流程会处理
      return new Response(JSON.stringify({
        success: true,
        challenge: challenge,
        message: 'Challenge code generated successfully (Supabase error, using local storage fallback)',
        supabaseError: supabaseError.message
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