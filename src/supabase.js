// Supabase客户端实例
import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from './config';

// 创建Supabase客户端实例
export const supabase = createClient(
  supabaseConfig.url,
  supabaseConfig.anonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      storage: localStorage
    }
  }
);

// 监听认证状态变化
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    console.log('用户已登录:', session.user);
    window.dispatchEvent(new Event('userLoggedIn'));
  } else if (event === 'SIGNED_OUT') {
    console.log('用户已登出');
    window.dispatchEvent(new Event('userLoggedOut'));
  }
});
