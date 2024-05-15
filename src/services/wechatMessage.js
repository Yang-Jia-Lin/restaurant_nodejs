const axios = require('axios');
require('dotenv').config();
const APP_ID = process.env.APP_ID;
const APP_SECRET = process.env.APP_SECRET;

// 可能需要一个地方来存储access_token和过期时间
let accessToken = {
    token: null,
    expires: 0
};

async function getAccessToken() {
    // 检查当前存储的accessToken是否有效
    if (accessToken.token && accessToken.expires > Date.now()) {
        return accessToken.token;
    }

    // 请求新的access_token
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APP_ID}&secret=${APP_SECRET}`;
    try {
        const response = await axios.get(url);
        if (response.data.access_token) {
            accessToken.token = response.data.access_token;
            // 设置过期时间，微信默认access_token有效期为7200秒，我们提前一些时间更新它
            accessToken.expires = Date.now() + (response.data.expires_in - 300) * 1000;
            return accessToken.token;
        } else {
            throw new Error('Failed to retrieve access token');
        }
    } catch (error) {
        console.error('Error fetching access token:', error);
        throw error;
    }
}

async function sendSubscribeMessage(toUser, templateId, page, data) {
    const accessToken = await getAccessToken(); // 确保这个函数能获取到当前有效的access_token
    const url = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${accessToken}`;
    const body = {
        touser: toUser,  // 被邀请人的OpenID
        template_id: templateId,  // 订阅消息模板ID
        page: page,  // 点击消息跳转的小程序页面
        data: data,  // 消息模板的数据
    };

    try {
        const response = await axios.post(url, body);
        return response.data;
    } catch (error) {
        console.error('发送订阅消息失败:', error);
        throw error;
    }
}

module.exports = {
    sendSubscribeMessage
};