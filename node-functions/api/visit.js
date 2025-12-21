// 文件路径 ./node-functions/api/visit.js
// 访问路径 https://www.58sb.cn/api/visit

// 处理网站访问量统计

// 处理POST请求 - 更新访问量
export default async function onRequest({ request, params }) {
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
  
  // 读取Key-Value数据
  const visitCount = await COVER_WAVE_KV.get('visitCount');
  
  let visitCountInt = Number(visitCount) || 0;
  visitCountInt += 1;

  // 写入Key-Value数据
  await COVER_WAVE_KV.put('visitCount', String(visitCountInt));

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
}

// 处理GET请求 - 获取访问量
export async function onRequestGet({ request, params }) {
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
  
  // 读取Key-Value数据
  const visitCount = await COVER_WAVE_KV.get('visitCount');
  
  let visitCountInt = Number(visitCount) || 0;

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
}