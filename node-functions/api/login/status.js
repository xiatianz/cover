// 文件路径 ./node-functions/api/login/status.js
// 访问路径 https://www.58sb.cn/api/login/status

// 查询登录状态，用于前端轮询

// 导入Supabase客户端
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
    
    // 获取查询参数
    const url = new URL(request.url);
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
    
    // 从Supabase获取挑战码状态
    let challengeData;
    try {
      const supabase = createSupabaseClient(env);
      const { data, error } = await supabase
        .from('login_challenges')
        .select('*')
        .eq('challenge', code)
        .single();
        
      if (error) {
        console.error('Supabase error:', error);
        return new Response(JSON.stringify({
          success: true,
          status: 'pending', // 改为pending，避免刚生成就显示过期
          message: 'Challenge code pending (Supabase error)',
          supabaseError: error.message
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
      challengeData = data;
    } catch (supabaseError) {
      console.error('Supabase error:', supabaseError);
      return new Response(JSON.stringify({
        success: true,
        status: 'pending', // 改为pending，避免刚生成就显示过期
        message: 'Challenge code pending (Supabase error)',
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
    
    if (!challengeData) {
      console.log(`Challenge code ${code} not found in Supabase`);
      return new Response(JSON.stringify({
        success: true,
        status: 'pending', // 改为pending，避免刚生成就显示过期
        message: 'Challenge code pending (not found in Supabase)',
        supabaseError: 'Challenge code not found in Supabase'
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
    
    // 检查挑战码是否过期
    if (Date.now() > new Date(challengeData.expires_at).getTime()) {
      try {
        const supabase = createSupabaseClient(env);
        await supabase
          .from('login_challenges')
          .delete()
          .eq('challenge', code);
      } catch (supabaseError) {
        console.error('Supabase error when deleting:', supabaseError);
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
      authToken: challengeData.auth_token || null,
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