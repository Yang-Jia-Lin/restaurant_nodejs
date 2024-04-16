require('dotenv').config();
const appId = process.env.APP_ID;
const appSecret = process.env.APP_SECRET;
const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

const userService = require('../services/usersService');
const router = express.Router();


// 处理登录请求
router.post('/login', async (req, res) => {
    try {
        // 1.获取code
        const { code } = req.body;
        if (!code) {
            throw new Error('缺少code参数');
        }

        // 2.使用code获取openid
        const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;
        const response = await axios.get(url);
        if (!response.data || !response.data.openid) {
            throw new Error('获取openId失败，微信服务器返回错误');
        }

        // 3.创建或获取用户
        let user = await userService.getUserByOpenId(response.data.openid);
        if (!user) {
            user = await userService.createUser({ openid: response.data.openid });
        }
        res.send({success: true, user });
    } catch (error) {
        console.error('处理登录请求时发生错误:', error.message);
        res.status(500).send(error.message);
    }
});


// 查找用户信息
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await userService.getUserById(userId);
        res.json({ success: true, user });
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(404).json({ success: false, message: error.message });
    }
});


// 删除用户信息
router.delete('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        await userService.deleteUser(userId);
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});


// 更新用户信息
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
router.put('/addPoints/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { pointsToAdd } = req.body;
        const updatedUser = await userService.addUserPoints(userId, pointsToAdd);
        res.json({ success: true, updatedUser });
    } catch (error) {
        console.error('Error adding points to user:', error);
        res.status(500).json({ success: false, message: 'Error adding points to user', error });
    }
});


// 获取手机号
function decryptData(encryptedData, iv, sessionKey) {
    try {
        const sessionKeyBuffer = Buffer.from(sessionKey, 'base64');
        const encryptedDataBuffer = Buffer.from(encryptedData, 'base64');
        const ivBuffer = Buffer.from(iv, 'base64');

        const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKeyBuffer, ivBuffer);
        decipher.setAutoPadding(true);
        let decoded = decipher.update(encryptedDataBuffer, 'binary', 'utf8');
        decoded += decipher.final('utf8');

        return JSON.parse(decoded);
    } catch (error) {
        throw new Error('解密失败');
    }
}
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


// 导出路由
module.exports = router;
