const Queue = require('bull');
const OrdersService = require('../services/ordersService');
require('dotenv').config();

// 创建队列
const updateOrderQueue = new Queue('updateOrderStatus', {
    	redis: {
    		host: process.env.REDIS_HOST,
    		port: process.env.REDIS_PORT, 
    		password: process.env.REDIS_PASSWORD
    	}
});

// 处理队列任务
updateOrderQueue.process(async (job) => {
    const { orderId, deInfo } = job.data;
    try {
        const result = await OrdersService.processPaidOrder(orderId);
        if (!result.success) {
            throw new Error(result.message);
        }
        console.log(`订单 ${orderId} 处理成功：`, result.message);
    } catch (error) {
        console.error(`处理订单更新队列任务失败: ${error.message}，订单ID: ${orderId}`);
        throw error; // 重抛错误以便 Bull 可以重试任务
    }
});


module.exports = {
    updateOrderQueue
};
