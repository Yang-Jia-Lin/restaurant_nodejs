const express = require('express');
const { updateOrderQueue } = require('./queueHandlers'); // 引入队列处理器
const OrdersService = require('../services/ordersService');
const PayService = require('../services/payService');
const router = express.Router();

// 创建PayService实例
const payService = new PayService();

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
        const verificationResult = await payService.verifyPaymentSuccess(req);
        if (!verificationResult.success) {
            console.error('支付验证失败:', verificationResult.message);
            return res.status(200).json({ code: 'FAIL', message: '支付验证失败' });
        }

        // 验证成功，将订单更新任务添加到队列
        await updateOrderQueue.add({
            orderId: verificationResult.deInfo.out_trade_no,
            deInfo: verificationResult.deInfo
        }, {
            attempts: 3, // 尝试执行任务的次数
            backoff: {
                type: 'fixed', // 或 'exponential'
                delay: 5000, // 重试间隔毫秒数
            }
        });


        // 立即向微信支付服务器响应，表示通知已接收
        res.status(200).json({ code: 'SUCCESS', message: '支付通知已接收' });

    } catch (error) {
        console.error('支付回调处理异常', error);
        res.status(200).json({ code: 'SUCCESS', message: '支付通知已接收，但处理中发生异常' });
    }
});



module.exports = router;