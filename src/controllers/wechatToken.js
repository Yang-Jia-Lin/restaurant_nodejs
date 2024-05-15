require('dotenv').config();
const token = process.env.TOKEN;
const crypto = require('crypto');
const express = require('express');
const router = express.Router();

// 用于解析JSON格式的中间件
router.use(express.json());

// 获取所有地址 - 用于验证微信服务器
router.get('/wechat', async (req, res) => {
    const { signature, timestamp, nonce, echostr } = req.query;

    // 按字典排序token、timestamp和nonce
    const args = [token, timestamp, nonce].sort().join('');

    // 创建哈希类型和生成签名
    const hash = crypto.createHash('sha1').update(args).digest('hex');

    // 将生成的签名和微信发送的签名比较
    if (hash === signature) {
        res.send(echostr); // 确认请求来自微信
    } else {
        res.send('verification failed'); // 验证失败
    }
});

// 处理POST请求 - 接收消息和事件
router.post('/wechat', (req, res) => {
    const message = req.body;
    console.log('Received message:', message);

    // 在实际的业务逻辑中，你可以根据message类型做更复杂的处理
    // 此处仅示例直接回复success

    // 快速响应微信服务器以避免重试
    res.send('success');
});

module.exports = router;