// Supabase配置文件
// 请将以下配置替换为您的Supabase项目信息

export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || '',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
};

// 微信登录配置
export const wechatConfig = {
  token: 'dadqfqefeqwcwcwe43534vwdvwv' // 微信公众号后台配置的Token
};
