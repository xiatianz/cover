// 文件路径 ./node-functions/api/upload.js
// 访问路径 https://www.58sb.cn/api/upload

// 处理文件上传请求，作为图床API的代理
export default async function onRequestPost({ request, params, env }) {
  try {
    // 获取环境变量
    const uploadApiUrl = env.VITE_APP_UPLOAD_API_URL;
    const uploadToken = env.VITE_APP_UPLOAD_TOKEN;
    const imageDomain = env.VITE_APP_IMAGE_DOMAIN;

    if (!uploadApiUrl || !uploadToken) {
      console.error('Missing configuration:', { uploadApiUrl, uploadToken });
      return new Response(JSON.stringify({ error: 'Missing configuration', details: { uploadApiUrl, uploadToken } }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }

    // 解析请求体
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }

    // 构建新的FormData
    const newFormData = new FormData();
    newFormData.append('file', file);

    // 构建图床API URL
    const url = new URL(uploadApiUrl);
    url.searchParams.append('returnFormat', 'full');
    url.searchParams.append('uploadFolder', 'cover');
    url.searchParams.append('uploadNameType', 'short');
    // 移除服务器压缩参数，不使用服务器压缩
    // url.searchParams.append('serverCompress', 'true');

    console.log('Sending request to:', url.toString());
    
    // 设置请求超时时间（30秒）
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Image bed API request timed out after 30 seconds'));
      }, 30000);
    });

    // 转发请求到图床API，带有超时控制
    const response = await Promise.race([
      fetch(url, { 
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${uploadToken}` // 尝试使用Bearer前缀
        },
        body: newFormData
      }),
      timeoutPromise
    ]);

    // 获取响应内容
    const text = await response.text();
    console.log('Response from image bed:', { status: response.status, text });
    
    let data;

    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse response:', e);
      throw new Error(`Invalid response from image bed: ${text}`);
    }

    // 处理返回的数据，替换为展示域名
    let processedData = data;
    if (Array.isArray(processedData)) {
      processedData = processedData.map(item => {
        if (item.src && typeof item.src === 'string') {
          // 检查是否为完整URL
          if (item.src.startsWith('http')) {
            // 替换为展示域名
            const url = new URL(item.src);
            const origin = url.origin;
            item.src = item.src.replace(origin, imageDomain);
          } else {
            // 处理相对路径
            if (!item.src.startsWith('/')) {
              item.src = `/${item.src}`;
            }
            item.src = `${imageDomain}${item.src}`;
          }
        }
        return item;
      });
    }
    
    // 返回响应
    return new Response(JSON.stringify(processedData), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  } catch (error) {
    console.error('Error in upload function:', error);
    return new Response(JSON.stringify({ error: error.message, stack: error.stack }), {
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