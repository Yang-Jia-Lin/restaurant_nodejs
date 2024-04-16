const express = require('express');
const PayService = require('../services/payService');
const { updateOrderQueue } = require('./queueHandlers'); // 队列处理器
const OrdersService = require('../services/ordersService');
const userService = require("../services/usersService");
const emailAlertService = require('../config/emailAlertService');
const router = express.Router();

// 创建PayService实例
const payService = new PayService();

// 支付初始化
router.post('/create_and_pay', async (req, res) => {
    try {
        // 1.创建订单
        const orderData = req.body.orderData;
        const orderDetails = req.body.orderDetails;
        const order = await OrdersService.createOrder(orderData, orderDetails);
        if (!order) {
            throw new Error('订单创建失败');
        }

        // 2.初始化支付并获取prepay_id
        const notifyUrl = 'https://forestlamb.online/restaurant/pay/payment-notify';
        const orderInfo = {
            order_id: order.order_id,
            description: order.description,
            total_price: order.total_price * 100,
            openid: orderData.openid
        };
        const prepayResult = await payService.getPrepayInfo(orderInfo, notifyUrl);
        if (prepayResult.data && prepayResult.data.prepay_id) {
            const paySignInfo = await payService.createPaySign(prepayResult.data.prepay_id);
            res.status(201).json({
                success: true,
                order: order,
                paySignInfo: paySignInfo
            });
        } else {
            console.error('获取prepay_id失败', prepayResult);
            res.status(500).json({ error: '获取prepay_id失败' });
        }
    } catch (error) {
        console.error('支付初始化失败', error);
        res.status(500).json({ error: '支付初始化失败' });
    }
});


// 支付结果通知
router.post('/payment-notify', async (req, res) => {
    try {
        // 验证支付结果
        const verificationResult = await payService.verifyPaymentSuccess(req);
        if (!verificationResult.success) {
            console.error('支付验证失败:', verificationResult.message);
            return res.status(200).json({ code: 'FAIL', message: '支付验证失败' });
        }
        res.status(200).json({ code: 'SUCCESS', message: '支付通知已接收' });// 响应微信支付服务器
        await addOrderToUpdateQueue(verificationResult.deInfo.out_trade_no);// 订单更新任务添加到队列
    } catch (error) {
        console.error('支付回调处理异常', error);
        await emailAlertService.sendEmail(
            'Critical Error Alert',
            `支付回调处理发生异常： ${error.message}`,
            '2239969828@qq.com' // 收件人地址
        );
        res.status(200).json({ code: 'SUCCESS', message: '支付通知已接收，但处理中发生异常' });
    }
});


// 积点支付
router.post('/create_and_pay_points', async (req, res) => {
    try {
        // 1.创建订单
        const orderData = req.body.orderData;
        const orderDetails = req.body.orderDetails;
        const order = await OrdersService.createOrder(orderData, orderDetails);

        // 2.消费积点
        const pointsToDeduct = req.body.pointsToDeduct;
        const userId = orderData.user_id;
        const user = await userService.getUserById(userId);
        if (user.points < pointsToDeduct) {
            throw new Error('积点不足');
        }
        const updatedUser = await userService.updateUser(userId, { points: user.points - pointsToDeduct });

        // 3.订单更新任务添加到队列
        await addOrderToUpdateQueue(order.order_id);

        // 4.返回结果
        res.status(201).json({success: true, order: order, user: updatedUser});

    } catch (error) {
        console.error('积点支付失败', error);
        await emailAlertService.sendEmail(
            'Critical Error Alert',
            `积点支付回调处理发生异常： ${error.message}`,
            '2239969828@qq.com' // 收件人地址
        );
        res.status(500).json({ error: '积点支付失败' });
    }
});


// 将订单添加到更新队列的公共函数
async function addOrderToUpdateQueue(orderId) {
    try {
        await updateOrderQueue.add({
            orderId: orderId
        }, {
            attempts: 3,
            backoff: {
                type: 'fixed',
                delay: 1000
            }
        });
    } catch (error) {
        throw error;
    }
}


module.exports = router;