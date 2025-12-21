// 文件路径 ./node-functions/api/visit.js
// 访问路径 https://www.58sb.cn/api/visit

// 处理网站访问量统计

// 处理POST请求 - 更新访问量
export default async function onRequest({ request, params, env }) {
  // 处理OPTIONS请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
      }
    });
  }
  
  try {
    let visitCountInt = 0;
    
    // 检查KV存储是否可用
    if (env && env.COVER_WAVE_KV) {
      // 读取Key-Value数据
      const visitCount = await env.COVER_WAVE_KV.get('visitCount');
      visitCountInt = Number(visitCount) || 0;
      visitCountInt += 1;

      // 写入Key-Value数据
      await env.COVER_WAVE_KV.put('visitCount', String(visitCountInt));
    } else {
      // KV存储不可用时，使用随机数模拟
      visitCountInt = Math.floor(Math.random() * 10000) + 1;
    }

    const res = JSON.stringify({
      success: true,
      visitCount: visitCountInt,
    });

    return new Response(res, {
      headers: {
        'content-type': 'application/json; charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error updating visit count:', error);
    
    // 发生错误时，返回随机数作为降级方案
    const res = JSON.stringify({
      success: true,
      visitCount: Math.floor(Math.random() * 10000) + 1,
    });

    return new Response(res, {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

// 处理GET请求 - 获取访问量
export async function onRequestGet({ request, params, env }) {
  // 处理OPTIONS请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
      }
    });
  }
  
  try {
    let visitCountInt = 0;
    
    // 检查KV存储是否可用
    if (env && env.COVER_WAVE_KV) {
      // 读取Key-Value数据
      const visitCount = await env.COVER_WAVE_KV.get('visitCount');
      visitCountInt = Number(visitCount) || 0;
    } else {
      // KV存储不可用时，使用随机数模拟
      visitCountInt = Math.floor(Math.random() * 10000);
    }

    const res = JSON.stringify({
      success: true,
      visitCount: visitCountInt,
    });

    return new Response(res, {
      headers: {
        'content-type': 'application/json; charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error getting visit count:', error);
    
    // 发生错误时，返回随机数作为降级方案
    const res = JSON.stringify({
      success: true,
      visitCount: Math.floor(Math.random() * 10000),
    });

    return new Response(res, {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}