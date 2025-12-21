// Supabase客户端配置，用于Edge Functions

// 模拟Deno对象，解决supabase-js库中的ReferenceError: Deno is not defined错误
if (typeof Deno === 'undefined') {
  global.Deno = {
    unrefTimer: (timerId) => {
      // 在Node.js中，setTimeout/setInterval返回的是数字，不需要unref
      // 这里只是一个空实现，用于避免supabase-js库报错
    }
  };
}

import { createClient } from '@supabase/supabase-js';

// 从环境变量获取配置
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

// 创建并导出Supabase客户端实例
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 登录挑战码表操作函数
export const loginChallenge = {
  // 创建挑战码记录
  async create(challenge, sessionId, expiresAt) {
    const { data, error } = await supabase
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
    
    return { data, error };
  },
  
  // 获取挑战码记录
  async get(challenge) {
    const { data, error } = await supabase
      .from('login_challenges')
      .select('*')
      .eq('challenge', challenge)
      .single();
    
    return { data, error };
  },
  
  // 更新挑战码状态
  async update(challenge, updates) {
    const { data, error } = await supabase
      .from('login_challenges')
      .update(updates)
      .eq('challenge', challenge)
      .single();
    
    return { data, error };
  },
  
  // 删除挑战码记录
  async delete(challenge) {
    const { error } = await supabase
      .from('login_challenges')
      .delete()
      .eq('challenge', challenge);
    
    return { error };
  }
};

// 登录会话表操作函数
export const authSession = {
  // 创建登录会话
  async create(authToken, userId, expiresAt, loginMethod) {
    const { data, error } = await supabase
      .from('auth_sessions')
      .insert({
        auth_token: authToken,
        user_id: userId,
        expires_at: new Date(expiresAt),
        login_method: loginMethod
      })
      .single();
    
    return { data, error };
  },
  
  // 获取登录会话
  async get(authToken) {
    const { data, error } = await supabase
      .from('auth_sessions')
      .select('*')
      .eq('auth_token', authToken)
      .single();
    
    return { data, error };
  }
};

// 用户表操作函数
export const user = {
  // 获取用户信息
  async get(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    return { data, error };
  },
  
  // 创建用户
  async create(userId) {
    const now = new Date();
    const { data, error } = await supabase
      .from('users')
      .insert({
        user_id: userId,
        created_at: now,
        last_login_at: now,
        history: []
      })
      .single();
    
    return { data, error };
  },
  
  // 更新用户信息
  async update(userId, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('user_id', userId)
      .single();
    
    return { data, error };
  }
};

// 微信验证码表操作函数
export const wechatCode = {
  // 创建验证码记录
  async create(sessionId, code, expiresAt) {
    const { data, error } = await supabase
      .from('wechat_codes')
      .insert({
        session_id: sessionId,
        code,
        expires_at: new Date(expiresAt),
        used: false
      })
      .single();
    
    return { data, error };
  },
  
  // 获取验证码记录
  async get(sessionId) {
    const { data, error } = await supabase
      .from('wechat_codes')
      .select('*')
      .eq('session_id', sessionId)
      .single();
    
    return { data, error };
  },
  
  // 更新验证码状态
  async update(sessionId, updates) {
    const { data, error } = await supabase
      .from('wechat_codes')
      .update(updates)
      .eq('session_id', sessionId)
      .single();
    
    return { data, error };
  },
  
  // 删除验证码记录
  async delete(sessionId) {
    const { error } = await supabase
      .from('wechat_codes')
      .delete()
      .eq('session_id', sessionId);
    
    return { error };
  }
};
