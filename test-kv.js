// 测试KV存储访问功能
// 运行方式：node test-kv.js

// 模拟EdgeOne Functions环境
try {
  // 导入所需模块
  const { EdgeOneKV } = require('edgeone-kv');
  
  // 测试KV访问
  async function testKV() {
    console.log('开始测试KV存储访问...');
    
    try {
      // 创建KV实例
      const kv = new EdgeOneKV('COVER_WAVE_KV');
      
      // 测试写入
      const testKey = 'test_challenge_12345';
      const testValue = {
        sessionId: 'test-session-123',
        expiresAt: Date.now() + 5 * 60 * 1000,
        status: 'pending',
        openid: null,
        authToken: null
      };
      
      console.log('写入测试数据到KV...');
      await kv.put(testKey, JSON.stringify(testValue));
      console.log('写入成功！');
      
      // 测试读取
      console.log('从KV读取测试数据...');
      const result = await kv.get(testKey);
      if (result) {
        console.log('读取成功！');
        console.log('读取到的数据:', JSON.parse(result));
      } else {
        console.log('读取失败，未找到数据');
      }
      
      // 测试删除
      console.log('从KV删除测试数据...');
      await kv.delete(testKey);
      console.log('删除成功！');
      
      console.log('KV存储访问测试完成！');
    } catch (error) {
      console.error('KV访问测试失败:', error.message);
      console.error('详细错误:', error);
    }
  }
  
  testKV();
} catch (error) {
  console.error('导入模块失败:', error.message);
  console.error('请确保已安装edgeone-kv模块:', 'npm install edgeone-kv');
}

// 模拟环境变量访问测试
console.log('\n测试环境变量访问...');
console.log('当前Node.js版本:', process.version);
console.log('环境变量COVER_WAVE_KV:', process.env.COVER_WAVE_KV || '未定义');
console.log('环境变量列表:', Object.keys(process.env).filter(key => key.includes('KV')));