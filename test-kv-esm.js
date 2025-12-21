// 测试KV存储访问功能 - ES模块版本
// 运行方式：node --experimental-modules test-kv-esm.js

// 模拟EdgeOne Functions的KV访问方式
console.log('开始测试EdgeOne Functions KV访问模拟...');

// 模拟EdgeOne Functions的env对象
const mockEnv = {
  COVER_WAVE_KV: {
    // 模拟KV存储操作
    _storage: new Map(),
    
    async put(key, value) {
      console.log(`KV.put(${key}, ${value})`);
      this._storage.set(key, value);
      return true;
    },
    
    async get(key) {
      console.log(`KV.get(${key})`);
      return this._storage.get(key);
    },
    
    async delete(key) {
      console.log(`KV.delete(${key})`);
      return this._storage.delete(key);
    }
  }
};

// 模拟挑战码生成函数
async function mockChallenge(env) {
  console.log('\n测试生成挑战码...');
  
  // 生成5位数字挑战码
  const challenge = Math.floor(10000 + Math.random() * 90000).toString();
  
  // 生成唯一的会话ID
  const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // 挑战码有效期5分钟
  const expiresAt = Date.now() + 5 * 60 * 1000;
  
  // 检查KV存储是否可用
  if (!env || !env.COVER_WAVE_KV) {
    console.error('KV storage not configured: env.COVER_WAVE_KV is undefined');
    return {
      success: true,
      challenge: challenge,
      message: 'Challenge code generated successfully (KV storage unavailable)',
      kvError: 'KV storage not configured'
    };
  }
  
  // 存储挑战码到KV
  try {
    await env.COVER_WAVE_KV.put(`login_challenge_${challenge}`, JSON.stringify({
      sessionId,
      expiresAt,
      status: 'pending',
      openid: null,
      authToken: null
    }));
    
    console.log(`挑战码 ${challenge} 已成功存储到KV`);
    
    // 从KV读取挑战码，验证存储成功
    const storedData = await env.COVER_WAVE_KV.get(`login_challenge_${challenge}`);
    if (storedData) {
      console.log('从KV读取到的挑战码数据:', JSON.parse(storedData));
      return {
        success: true,
        challenge: challenge,
        message: 'Challenge code generated successfully',
        sessionId: sessionId
      };
    } else {
      console.error('无法从KV读取挑战码');
      return {
        success: true,
        challenge: challenge,
        message: 'Challenge code generated successfully (KV read failed)',
        kvError: 'KV read failed'
      };
    }
  } catch (kvError) {
    console.error('KV storage error:', kvError);
    return {
      success: true,
      challenge: challenge,
      message: 'Challenge code generated successfully (KV storage error)',
      kvError: kvError.message
    };
  }
}

// 模拟登录验证函数
async function mockVerifyCode(env, code, openid) {
  console.log(`\n测试验证验证码 ${code}，openid: ${openid}`);
  
  if (!env || !env.COVER_WAVE_KV) {
    console.error('KV storage not configured: env.COVER_WAVE_KV is undefined');
    return {
      success: false,
      error: 'KV storage not configured'
    };
  }
  
  // 从KV获取挑战码
  const key = `login_challenge_${code}`;
  const challengeDataStr = await env.COVER_WAVE_KV.get(key);
  
  if (!challengeDataStr) {
    console.error('挑战码不存在或已过期');
    return {
      success: false,
      error: 'Invalid or expired challenge code'
    };
  }
  
  const challengeData = JSON.parse(challengeDataStr);
  
  // 检查挑战码是否过期
  if (Date.now() > challengeData.expiresAt) {
    await env.COVER_WAVE_KV.delete(key);
    console.error('挑战码已过期');
    return {
      success: false,
      error: 'Challenge code expired'
    };
  }
  
  // 检查挑战码状态
  if (challengeData.status !== 'pending') {
    console.error('挑战码已使用');
    return {
      success: false,
      error: 'Challenge code already used'
    };
  }
  
  // 生成登录令牌
  const authToken = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.floor(Math.random() * 10000)}`;
  
  // 更新挑战码状态为成功
  await env.COVER_WAVE_KV.put(key, JSON.stringify({
    ...challengeData,
    status: 'success',
    openid: openid,
    authToken: authToken
  }));
  
  console.log('登录验证成功！');
  console.log('生成的authToken:', authToken);
  
  return {
    success: true,
    authToken,
    userId: openid,
    message: 'Login successful'
  };
}

// 测试完整的登录流程
async function testLoginFlow() {
  console.log('\n=== 测试完整登录流程 ===');
  
  // 1. 生成挑战码
  const challengeResult = await mockChallenge(mockEnv);
  console.log('生成挑战码结果:', challengeResult);
  
  if (!challengeResult.success) {
    console.error('生成挑战码失败');
    return;
  }
  
  const challenge = challengeResult.challenge;
  
  // 2. 模拟用户发送验证码到公众号
  console.log(`\n模拟用户发送验证码 ${challenge} 到公众号`);
  
  // 3. 验证验证码
  const openid = `test-openid-${Date.now()}`;
  const verifyResult = await mockVerifyCode(mockEnv, challenge, openid);
  console.log('验证验证码结果:', verifyResult);
  
  if (verifyResult.success) {
    console.log('\n🎉 完整登录流程测试成功！');
    console.log('挑战码:', challenge);
    console.log('用户openid:', openid);
    console.log('生成的authToken:', verifyResult.authToken);
  } else {
    console.error('\n❌ 完整登录流程测试失败！');
  }
}

// 运行测试
testLoginFlow();

console.log('\n测试完成！');
