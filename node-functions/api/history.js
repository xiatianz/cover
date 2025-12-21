// 文件路径 ./node-functions/api/history.js
// 访问路径 https://www.58sb.cn/api/history

// 管理用户历史记录
export default async function onRequest(context) {
  // 处理OPTIONS请求
  if (context.request.method === 'OPTIONS') {
    return handleOptions();
  }
  
  // 验证认证令牌
  const authToken = context.request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!authToken) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Missing auth token' }), {
      status: 401,
      headers: getCorsHeaders()
    });
  }
  
  // 从KV获取认证信息
  const authDataStr = await context.env.COVER_WAVE_KV.get(`auth_${authToken}`);
  if (!authDataStr) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Invalid auth token' }), {
      status: 401,
      headers: getCorsHeaders()
    });
  }
  
  const authData = JSON.parse(authDataStr);
  
  // 检查令牌是否过期
  if (Date.now() > authData.expiresAt) {
    await context.env.COVER_WAVE_KV.delete(`auth_${authToken}`);
    return new Response(JSON.stringify({ error: 'Unauthorized: Auth token expired' }), {
      status: 401,
      headers: getCorsHeaders()
    });
  }
  
  const userId = authData.userId;
  
  // 处理GET请求 - 获取历史记录
  if (context.request.method === 'GET') {
    return handleGetHistory(context, userId);
  }
  
  // 处理POST请求 - 添加历史记录
  if (context.request.method === 'POST') {
    return handleAddHistory(context, userId);
  }
  
  // 处理DELETE请求 - 清除历史记录
  if (context.request.method === 'DELETE') {
    return handleClearHistory(context, userId);
  }
  
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: getCorsHeaders()
  });
}

// 处理GET请求 - 获取历史记录
async function handleGetHistory(context, userId) {
  try {
    // 获取用户数据
    const userDataStr = await context.env.COVER_WAVE_KV.get(`user_${userId}`);
    if (!userDataStr) {
      return new Response(JSON.stringify({
        success: true,
        history: []
      }), {
        status: 200,
        headers: getCorsHeaders()
      });
    }
    
    const userData = JSON.parse(userDataStr);
    
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
async function handleAddHistory(context, userId) {
  try {
    const record = await context.request.json();
    
    if (!record.url || !record.name) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: getCorsHeaders()
      });
    }
    
    // 获取用户数据
    const userDataStr = await context.env.COVER_WAVE_KV.get(`user_${userId}`);
    let userData = {
      userId,
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      history: []
    };
    
    if (userDataStr) {
      userData = JSON.parse(userDataStr);
    }
    
    // 添加新记录到历史记录开头
    const newRecord = {
      ...record,
      timestamp: record.timestamp || new Date().toLocaleString()
    };
    
    userData.history.unshift(newRecord);
    
    // 限制历史记录数量为50条
    if (userData.history.length > 50) {
      userData.history = userData.history.slice(0, 50);
    }
    
    // 更新用户数据
    await context.env.COVER_WAVE_KV.put(`user_${userId}`, JSON.stringify(userData));
    
    return new Response(JSON.stringify({
      success: true,
      history: userData.history
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
async function handleClearHistory(context, userId) {
  try {
    // 获取用户数据
    const userDataStr = await context.env.COVER_WAVE_KV.get(`user_${userId}`);
    if (!userDataStr) {
      return new Response(JSON.stringify({
        success: true,
        history: []
      }), {
        status: 200,
        headers: getCorsHeaders()
      });
    }
    
    const userData = JSON.parse(userDataStr);
    
    // 清空历史记录
    userData.history = [];
    
    // 更新用户数据
    await context.env.COVER_WAVE_KV.put(`user_${userId}`, JSON.stringify(userData));
    
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