// 文件路径 ./node-functions/api/wechat/callback.js
// 访问路径 https://www.58sb.cn/api/wechat/callback

// 处理微信公众号消息推送，支持用户发送"获取"获取验证码

// 微信消息解析工具函数 - 使用纯JavaScript实现，不依赖DOM API
function parseXml(xmlStr) {
  const result = {};
  // 简单的XML解析，仅处理微信消息格式
  const tagRegex = /<([^>]+)>([^<]*)<\/\1>/g;
  let match;
  while ((match = tagRegex.exec(xmlStr)) !== null) {
    const tagName = match[1];
    const tagValue = match[2];
    // 处理CDATA内容
    const cdataMatch = tagValue.match(/<!\[CDATA\[(.*?)\]\]>/s);
    result[tagName] = cdataMatch ? cdataMatch[1] : tagValue;
  }
  return result;
}

// 生成微信消息回复XML
function generateReplyXml(toUserName, fromUserName, content) {
  const now = new Date().getTime();
  return `<xml>
  <ToUserName><![CDATA[${toUserName}]]></ToUserName>
  <FromUserName><![CDATA[${fromUserName}]]></FromUserName>
  <CreateTime>${now}</CreateTime>
  <MsgType><![CDATA[text]]></MsgType>
  <Content><![CDATA[${content}]]></Content>
</xml>`;
}

// 生成6位随机验证码
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 微信消息处理主函数
export default async function onRequest({ request, params, env }) {
  try {
    // 处理GET请求 - 微信验证
    if (request.method === 'GET') {
      const url = new URL(request.url);
      const signature = url.searchParams.get('signature');
      const timestamp = url.searchParams.get('timestamp');
      const nonce = url.searchParams.get('nonce');
      const echostr = url.searchParams.get('echostr');
      
      // 公众号后台配置的Token
      const TOKEN = 'dadqfqefeqwcwcwe43534vwdvwv';
      
      // 验证微信签名
      const checkSignature = async (signature, timestamp, nonce, token) => {
        const arr = [token, timestamp, nonce].sort();
        const str = arr.join('');
        
        // 使用Deno内置的Crypto API计算SHA-1哈希
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-1', data);
        
        // 将ArrayBuffer转换为十六进制字符串
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        return hashHex === signature;
      };
      
      try {
        if (await checkSignature(signature, timestamp, nonce, TOKEN)) {
          return new Response(echostr || 'Invalid request', {
            status: 200,
            headers: {
              'Content-Type': 'text/plain',
              'Access-Control-Allow-Origin': '*'
            }
          });
        } else {
          return new Response('Invalid signature', {
            status: 403,
            headers: {
              'Content-Type': 'text/plain',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }
      } catch (error) {
        console.error('Signature verification error:', error);
        return new Response('Verification error', {
          status: 500,
          headers: {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    }
    
    // 处理POST请求 - 微信消息
    if (request.method === 'POST') {
      const xmlStr = await request.text();
      const message = parseXml(xmlStr);
      
      const { ToUserName, FromUserName, MsgType, Content } = message;
      
      // 仅处理文本消息
      if (MsgType === 'text') {
        const userContent = Content.trim();
        
        // 处理用户发送5位数字验证码的情况
        if (userContent.length === 5 && /^\d+$/.test(userContent)) {
          try {
            // 调用验证API，完成登录
            const verifyResponse = await fetch('https://www.58sb.cn/api/login/verify-code', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                code: userContent,
                openid: FromUserName
              })
            });
            
            const verifyResult = await verifyResponse.json();
            
            if (verifyResult.success) {
              // 登录成功
              const replyContent = '登录成功！您可以返回网站继续使用。';
              const replyXml = generateReplyXml(FromUserName, ToUserName, replyContent);
              
              return new Response(replyXml, {
                status: 200,
                headers: {
                  'Content-Type': 'application/xml',
                  'Access-Control-Allow-Origin': '*'
                }
              });
            } else {
              // 登录失败
              const replyContent = '验证码无效或已过期，请重新获取并发送。';
              const replyXml = generateReplyXml(FromUserName, ToUserName, replyContent);
              
              return new Response(replyXml, {
                status: 200,
                headers: {
                  'Content-Type': 'application/xml',
                  'Access-Control-Allow-Origin': '*'
                }
              });
            }
          } catch (error) {
            console.error('Verification API call failed:', error);
            const replyContent = '登录验证失败，请稍后重试。';
            const replyXml = generateReplyXml(FromUserName, ToUserName, replyContent);
            
            return new Response(replyXml, {
              status: 200,
              headers: {
                'Content-Type': 'application/xml',
                'Access-Control-Allow-Origin': '*'
              }
            });
          }
        } else if (userContent === '获取') {
          // 兼容原有功能，发送引导信息
          const replyContent = '请在网站登录页面获取验证码，然后将验证码发送给我完成登录。';
          const replyXml = generateReplyXml(FromUserName, ToUserName, replyContent);
          
          return new Response(replyXml, {
            status: 200,
            headers: {
              'Content-Type': 'application/xml',
              'Access-Control-Allow-Origin': '*'
            }
          });
        } else {
          // 处理其他文本消息
          const replyContent = '请在网站登录页面获取5位验证码，然后将验证码发送给我完成登录。';
          const replyXml = generateReplyXml(FromUserName, ToUserName, replyContent);
          
          return new Response(replyXml, {
            status: 200,
            headers: {
              'Content-Type': 'application/xml',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }
      }
      
      // 处理关注事件
      if (MsgType === 'event' && message.Event === 'subscribe') {
        const replyContent = '欢迎关注！请发送"获取"获取验证码，用于网站登录。';
        const replyXml = generateReplyXml(FromUserName, ToUserName, replyContent);
        
        return new Response(replyXml, {
          status: 200,
          headers: {
            'Content-Type': 'application/xml',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    }
    
    return new Response('Invalid request', {
      status: 400,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Error in wechat callback:', error);
    return new Response('Internal Server Error', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}