// Vercel Serverless Function
const https = require('https');
const http = require('http');

module.exports = (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).send('Missing "url" parameter');
    }

    // 自动判断协议
    const protocol = url.startsWith('https') ? https : http;

    // 模拟 Clash 客户端请求，极大降低被墙概率
    const options = {
        headers: {
            'User-Agent': 'ClashforWindows/0.20.39',
            'Accept': '*/*',
            'Connection': 'keep-alive'
        }
    };

    const proxyReq = protocol.get(url, options, (proxyRes) => {
        // 允许跨域
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'text/plain');
        
        // 传递订阅信息头 (流量、到期时间等)
        if (proxyRes.headers['subscription-userinfo']) {
            res.setHeader('subscription-userinfo', proxyRes.headers['subscription-userinfo']);
        }
        if (proxyRes.headers['profile-update-interval']) {
            res.setHeader('profile-update-interval', proxyRes.headers['profile-update-interval']);
        }

        // 管道流传输数据
        proxyRes.pipe(res);
    });

    proxyReq.on('error', (e) => {
        res.status(500).send(`Proxy Error: ${e.message}`);
    });
};
