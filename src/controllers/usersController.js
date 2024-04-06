require('dotenv').config();
const express = require('express');
const axios = require('axios');
const userService = require('../services/usersService');
const router = express.Router();

const appId = process.env.APP_ID;
const appSecret = process.env.APP_SECRET;

// 1.处理登录请求，获取openid
async function handleLogin(req, res) {
    try {
        const { code } = req.body;
        if (!code) {
            console.log('请求中缺少code参数');
            return res.status(400).send('缺少code参数');
        }
        const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;
        const response = await axios.get(url);

        if (response.data && response.data.openid) {
            console.log('成功获取到openId:', response.data.openid);
            // 检查用户是否已存在
            let user = await userService.getUserByOpenId(response.data.openid);
            if (!user) {
                // 如果用户不存在，创建新用户
                user = await userService.createUser({ openid: response.data.openid });
            }
            res.send({success: true, user });
        } else {
            console.log('微信服务器返回错误:', response.data);
            res.status(500).send('无法获取openId');
        }
    } catch (error) {
        console.error('处理登录请求时发生错误:', error);
        res.status(500).send('内部服务器错误');
    }
}

router.post('/login', handleLogin);

// 2.查找用户信息
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await userService.getUserById(userId);
        res.json({ success: true, user });
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(404).json({ success: false, message: 'User not found', error });
    }
});

// 3.删除用户信息
router.delete('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        await userService.deleteUser(userId);
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, message: 'Error deleting user', error });
    }
});

// 4.更新用户信息
router.put('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const updateData = req.body;
        const updatedUser = await userService.updateUser(userId, updateData);
        res.json({ success: true, updatedUser });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ success: false, message: 'Error updating user', error });
    }
});

// 5.获取手机号
router.post('/phone', async (req, res) => {
    const { code, encryptedData, iv } = req.body;

    // 使用 code 获取 session_key
    const sessionKeyUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;

    try {
        const sessionRes = await axios.get(sessionKeyUrl);
        const { session_key } = sessionRes.data;

        // 使用 session_key 解密 encryptedData 获取手机号
        // 需要使用微信加密数据解密算法
        const phoneNumberInfo = decryptData(encryptedData, iv, session_key);

        // 返回解密后的手机号信息
        res.json({ success: true, data: phoneNumberInfo });
    } catch (error) {
        console.error('获取手机号失败:', error);
        res.status(500).json({ success: false, message: '获取手机号失败', error: error.toString() });
    }
});

// 解密方法实现，需要用到 crypto 模块
const crypto = require('crypto');

function decryptData(encryptedData, iv, sessionKey) {
    // base64 decode
    const sessionKeyBuffer = Buffer.from(sessionKey, 'base64');
    const encryptedDataBuffer = Buffer.from(encryptedData, 'base64');
    const ivBuffer = Buffer.from(iv, 'base64');

    try {
        // 解密
        const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKeyBuffer, ivBuffer);
        decipher.setAutoPadding(true);
        let decoded = decipher.update(encryptedDataBuffer, 'binary', 'utf8');
        decoded += decipher.final('utf8');

        const decodedData = JSON.parse(decoded);

        return decodedData;
    } catch (error) {
        throw new Error('解密失败');
    }
}

// 导出路由
module.exports = router;
