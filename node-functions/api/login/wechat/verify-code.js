// 文件路径 ./node-functions/api/login/wechat/verify-code.js
// 访问路径 https://www.58sb.cn/api/login/wechat/verify-code

// 导入Supabase客户端
import { wechatCode, authSession, user } from '../../../utils/supabase.js';

// 验证微信公众号登录验证码并生成登录会话
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
    
    const { sessionId, code } = requestBody;
    
    if (!sessionId || !code) {
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
    
    // 从Supabase获取验证码
    const { data: codeData, error: getCodeError } = await wechatCode.get(sessionId);
    if (getCodeError || !codeData) {
      console.error('Supabase error when getting wechat code:', getCodeError);
      return new Response(JSON.stringify({ error: 'Invalid session or code expired' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
    
    // 检查验证码是否过期
    if (Date.now() > new Date(codeData.expires_at).getTime()) {
      // 删除过期验证码
      try {
        await wechatCode.delete(sessionId);
      } catch (supabaseError) {
        console.error('Supabase error when deleting expired code:', supabaseError);
      }
      return new Response(JSON.stringify({ error: 'Verification code expired' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
    
    // 检查验证码是否已使用
    if (codeData.used) {
      return new Response(JSON.stringify({ error: 'Verification code already used' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
    
    // 检查验证码是否正确
    if (codeData.code !== code) {
      return new Response(JSON.stringify({ error: 'Invalid verification code' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
    
    // 标记验证码为已使用
    try {
      await wechatCode.update(sessionId, {
        used: true
      });
    } catch (supabaseError) {
      console.error('Supabase error when updating code status:', supabaseError);
      // 继续执行，不影响登录流程
    }
    
    // 生成登录令牌 - 使用时间戳+随机数替代crypto API
    const authToken = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.floor(Math.random() * 10000)}`;
    
    // 生成用户ID（基于sessionId的哈希，实际生产环境中应该使用用户的OpenID）
    const userId = await hashSessionId(sessionId);
    
    // 登录会话有效期30天
    const authExpiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
    
    // 存储登录会话
    try {
      await authSession.create(authToken, userId, authExpiresAt, 'wechat');
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
      const { data: existingUser, error: getUserError } = await user.get(userId);
      if (getUserError || !existingUser) {
        // 创建新用户
        await user.create(userId);
      } else {
        // 更新最后登录时间
        await user.update(userId, {
          last_login_at: new Date()
        });
      }
    } catch (supabaseError) {
      console.error('Supabase error when updating user data:', supabaseError);
      // 继续执行，不影响登录流程
    }
    
    return new Response(JSON.stringify({
      success: true,
      authToken,
      userId,
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
    console.error('Error verifying wechat code:', error);
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

// 简单的哈希函数 - 替代crypto.subtle.digest
function hashSessionId(sessionId) {
  // 使用简单的字符串哈希算法
  let hash = 0;
  for (let i = 0; i < sessionId.length; i++) {
    const char = sessionId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  // 转换为十六进制字符串，确保32位长度
  return Math.abs(hash).toString(16).padStart(32, '0');
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