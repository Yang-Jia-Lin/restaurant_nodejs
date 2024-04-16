const Queue = require('bull');
const OrdersService = require('../services/ordersService');
const emailAlertService = require("../config/emailAlertService");
require('dotenv').config();

// 创建队列
const updateOrderQueue = new Queue('updateOrderStatus', {
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD
    }
});

// 监听队列任务
updateOrderQueue.process(async (job) => {
    const { orderId } = job.data;
    try {
        await OrdersService.processPaidOrder(orderId);
        console.log(`订单 ${orderId} 处理成功`);
    } catch (error) {
        console.error(`处理订单任务失败: ${error.message}，订单ID: ${orderId}`);
        throw error; // 重抛错误以便重试
    }
});

// 任务失败事件监听
updateOrderQueue.on('failed', async (job, err) => {  // 在这里加入 async
    if (job.attemptsMade >= job.opts.attempts) {
        console.log(`Job ${job.id} failed after ${job.attemptsMade} attempts`);
        try {
            await emailAlertService.sendEmail(
                'Critical Error Alert',
                `订单处理多次后仍然失败，订单ID：${job.data.orderId}，错误信息： ${err.message}`,
                '2239969828@qq.com' // 收件人地址
            );
        } catch (emailError) {
            console.error(`Failed to send failure alert email: ${emailError.message}`);
        }
    }
});


module.exports = {
    updateOrderQueue
};
