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

// 创建Supabase客户端实例的工厂函数，接收env参数
export const createSupabaseClient = (env) => {
  // 从env参数获取配置
  const url = env.SUPABASE_URL || '';
  const anonKey = env.SUPABASE_ANON_KEY || '';
  
  return createClient(url, anonKey);
};
