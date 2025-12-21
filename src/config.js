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

// 默认配置（兼容旧代码）
export const defaultConfig = {
  watermark: 'Canvas-Ruom',
  text: 'Canvas-Ruom',
  fontFamily: 'Arial',
  fontOptions: [
    { label: 'Arial', value: 'Arial' },
    { label: 'Helvetica', value: 'Helvetica' },
    { label: 'Times New Roman', value: 'Times New Roman' },
    { label: 'Courier New', value: 'Courier New' },
    { label: 'Georgia', value: 'Georgia' },
    { label: 'Verdana', value: 'Verdana' }
  ],
  fontStyles: [],
  fontList: []
};
