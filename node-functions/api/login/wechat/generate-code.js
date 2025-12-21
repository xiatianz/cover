// 文件路径 ./node-functions/api/login/wechat/generate-code.js
// 访问路径 https://www.58sb.cn/api/login/wechat/generate-code

// 导入Supabase客户端
import { createSupabaseClient } from '../../../utils/supabase.js';

// 生成微信公众号登录验证码并存储到Supabase
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
    
    // 生成6位随机验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 生成唯一的会话ID - 使用时间戳+随机数替代crypto API
    const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 验证码有效期5分钟
    const expiresAt = Date.now() + 5 * 60 * 1000;
    
    // 存储验证码到Supabase
    try {
      const supabase = createSupabaseClient(env);
      const { error } = await supabase
        .from('wechat_codes')
        .insert({
          session_id: sessionId,
          code,
          expires_at: new Date(expiresAt),
          used: false
        })
        .single();
      if (error) {
        throw error;
      }
    } catch (supabaseError) {
      console.error('Supabase error when storing wechat code:', supabaseError);
      return new Response(JSON.stringify({ error: 'Failed to store verification code' }), {
        status: 500,
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
      sessionId,
      code: code, // 实际生产环境中，这个验证码应该通过公众号发送给用户，而不是直接返回
      message: '验证码生成成功'
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
    console.error('Error generating wechat code:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate verification code',
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