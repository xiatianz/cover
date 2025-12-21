// 文件路径 ./node-functions/api/history.js
// 访问路径 https://www.58sb.cn/api/history

// 导入Supabase客户端
import { createSupabaseClient } from '../utils/supabase.js';

// 管理用户历史记录
export default async function onRequest({ request, params, env }) {
  // 处理OPTIONS请求
  if (request.method === 'OPTIONS') {
    return handleOptions();
  }
  
  // 验证认证令牌
  const authToken = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!authToken) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Missing auth token' }), {
      status: 401,
      headers: getCorsHeaders()
    });
  }
  
  // 从Supabase获取认证信息
  const supabase = createSupabaseClient(env);
  const { data: authData, error: authError } = await supabase
    .from('auth_sessions')
    .select('*')
    .eq('auth_token', authToken)
    .single();
    
  if (authError || !authData) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Invalid auth token' }), {
      status: 401,
      headers: getCorsHeaders()
    });
  }
  
  // 检查令牌是否过期
  if (Date.now() > new Date(authData.expires_at).getTime()) {
    // 在实际应用中，可能需要添加删除过期会话的逻辑
    return new Response(JSON.stringify({ error: 'Unauthorized: Auth token expired' }), {
      status: 401,
      headers: getCorsHeaders()
    });
  }
  
  const userId = authData.user_id;
  
  // 处理GET请求 - 获取历史记录
  if (request.method === 'GET') {
    return handleGetHistory(supabase, userId);
  }
  
  // 处理POST请求 - 添加历史记录
  if (request.method === 'POST') {
    return handleAddHistory(supabase, request, userId);
  }
  
  // 处理DELETE请求 - 清除历史记录
  if (request.method === 'DELETE') {
    return handleClearHistory(supabase, userId);
  }
  
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: getCorsHeaders()
  });
}

// 处理GET请求 - 获取历史记录
async function handleGetHistory(supabase, userId) {
  try {
    // 获取用户数据
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (userError || !userData) {
      return new Response(JSON.stringify({
        success: true,
        history: []
      }), {
        status: 200,
        headers: getCorsHeaders()
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      history: userData.history || []
    }), {
      status: 200,
      headers: getCorsHeaders()
    });
  } catch (error) {
    console.error('Error getting history:', error);
    return new Response(JSON.stringify({ error: 'Failed to get history' }), {
      status: 500,
      headers: getCorsHeaders()
    });
  }
}

// 处理POST请求 - 添加历史记录
async function handleAddHistory(supabase, request, userId) {
  try {
    const record = await request.json();
    
    if (!record.url || !record.name) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: getCorsHeaders()
      });
    }
    
    // 获取用户数据
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    let updatedUserData = {
      userId,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      history: []
    };
    
    if (userData) {
      updatedUserData = userData;
    }
    
    // 添加新记录到历史记录开头
    const newRecord = {
      ...record,
      timestamp: record.timestamp || new Date().toLocaleString()
    };
    
    // 确保history是数组
    if (!Array.isArray(updatedUserData.history)) {
      updatedUserData.history = [];
    }
    
    updatedUserData.history.unshift(newRecord);
    
    // 限制历史记录数量为50条
    if (updatedUserData.history.length > 50) {
      updatedUserData.history = updatedUserData.history.slice(0, 50);
    }
    
    // 更新用户数据
    await supabase
      .from('users')
      .update({
        history: updatedUserData.history
      })
      .eq('user_id', userId)
      .single();
    
    return new Response(JSON.stringify({
      success: true,
      history: updatedUserData.history
    }), {
      status: 200,
      headers: getCorsHeaders()
    });
  } catch (error) {
    console.error('Error adding history:', error);
    return new Response(JSON.stringify({ error: 'Failed to add history' }), {
      status: 500,
      headers: getCorsHeaders()
    });
  }
}

// 处理DELETE请求 - 清除历史记录
async function handleClearHistory(supabase, userId) {
  try {
    // 更新用户数据，清空历史记录
    await supabase
      .from('users')
      .update({
        history: []
      })
      .eq('user_id', userId)
      .single();
    
    return new Response(JSON.stringify({
      success: true,
      history: []
    }), {
      status: 200,
      headers: getCorsHeaders()
    });
  } catch (error) {
    console.error('Error clearing history:', error);
    return new Response(JSON.stringify({ error: 'Failed to clear history' }), {
      status: 500,
      headers: getCorsHeaders()
    });
  }
}

// 处理OPTIONS请求
function handleOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      ...getCorsHeaders(),
      'Access-Control-Max-Age': '86400'
    }
  });
}

// 获取CORS头
function getCorsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
}