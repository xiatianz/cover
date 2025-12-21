// 文件路径 ./node-functions/api/wechat/callback.js
// 访问路径 https://www.58sb.cn/api/wechat/callback

// 处理微信公众号消息推送，支持用户发送"获取"获取验证码

// 微信消息解析工具函数
function parseXml(xmlStr) {
  const result = {};
  const xml = new DOMParser().parseFromString(xmlStr, 'text/xml');
  const root = xml.documentElement;
  
  for (let i = 0; i < root.childNodes.length; i++) {
    const node = root.childNodes[i];
    if (node.nodeType === 1) {
      result[node.nodeName] = node.textContent;
    }
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
export default async function onRequest(context) {
  try {
    // 处理GET请求 - 微信验证
    if (context.request.method === 'GET') {
      const url = new URL(context.request.url);
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
        
        // 使用纯JavaScript实现的SHA-1算法，替代crypto.subtle.digest
        function sha1(str) {
          const rotateLeft = (n, s) => (n << s) | (n >>> (32 - s));
          const ch = (x, y, z) => (x & y) ^ (~x & z);
          const parity = (x, y, z) => x ^ y ^ z;
          const maj = (x, y, z) => (x & y) ^ (x & z) ^ (y & z);
          const f = (t, x, y, z) => {
            if (t < 20) return ch(x, y, z);
            if (t < 40) return parity(x, y, z);
            if (t < 60) return maj(x, y, z);
            return parity(x, y, z);
          };
          const K = (t) => {
            if (t < 20) return 0x5a827999;
            if (t < 40) return 0x6ed9eba1;
            if (t < 60) return 0x8f1bbcdc;
            return 0xca62c1d6;
          };

          let h0 = 0x67452301;
          let h1 = 0xefcdab89;
          let h2 = 0x98badcfe;
          let h3 = 0x10325476;
          let h4 = 0xc3d2e1f0;

          const bytes = [];
          for (let i = 0; i < str.length; i++) {
            bytes.push(str.charCodeAt(i));
          }
          bytes.push(0x80);

          while ((bytes.length * 8) % 512 !== 448) {
            bytes.push(0x00);
          }

          const bitLength = str.length * 8;
          for (let i = 0; i < 8; i++) {
            bytes.push((bitLength >>> (56 - 8 * i)) & 0xff);
          }

          for (let i = 0; i < bytes.length; i += 64) {
            const w = new Array(80);
            for (let t = 0; t < 16; t++) {
              w[t] = (bytes[i + t * 4] << 24) | (bytes[i + t * 4 + 1] << 16) | (bytes[i + t * 4 + 2] << 8) | bytes[i + t * 4 + 3];
            }
            for (let t = 16; t < 80; t++) {
              w[t] = rotateLeft(w[t - 3] ^ w[t - 8] ^ w[t - 14] ^ w[t - 16], 1);
            }

            let a = h0;
            let b = h1;
            let c = h2;
            let d = h3;
            let e = h4;

            for (let t = 0; t < 80; t++) {
              const temp = rotateLeft(a, 5) + f(t, b, c, d) + e + K(t) + w[t];
              e = d;
              d = c;
              c = rotateLeft(b, 30);
              b = a;
              a = temp;
            }

            h0 = (h0 + a) & 0xffffffff;
            h1 = (h1 + b) & 0xffffffff;
            h2 = (h2 + c) & 0xffffffff;
            h3 = (h3 + d) & 0xffffffff;
            h4 = (h4 + e) & 0xffffffff;
          }

          const format = (n) => {
            let s = n.toString(16);
            while (s.length < 8) s = '0' + s;
            return s;
          };

          return format(h0) + format(h1) + format(h2) + format(h3) + format(h4);
        }

        const sha1Result = sha1(str);
        return sha1Result === signature;
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
    if (context.request.method === 'POST') {
      const xmlStr = await context.request.text();
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