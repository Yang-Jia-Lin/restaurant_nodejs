const express = require('express');
const OrdersService = require('../services/ordersService');
const router = express.Router();


// 手动点击开始制作订单接口
router.patch('/:orderId/begin-make', async (req, res) => {
    try {
        const order = await OrdersService.getOrderById(req.params.orderId);
        await OrdersService.beginMakeOrder(order);
        res.status(200).send({message: '订单开始制作成功'});
    } catch (error) {
        console.error('处理订单开始制作请求时出现错误', error);
        res.status(500).send({error: error.message});
    }
});


// ===================================用户操作==================================
// ============================================================================

// 1.用户获取所有订单
router.get('/user/:userId', async (req, res) => {
    try {
        const orders = await OrdersService.getOrdersByUserId(req.params.userId);
        res.status(200).send(orders);
    } catch (error) {
        console.error('用户获取所有订单请求时出现错误', error.message);
        res.status(400).send({error: error.message});
    }
});

// 2.用户获取特定订单
router.get('/user/:userId/status/:status', async (req, res) => {
    try {
        const orders = await OrdersService.getOrdersByUserIdAndStatus(req.params.userId, req.params.status);
        res.status(200).send(orders);
    } catch (error) {
        console.error('用户获取特定订单status请求时出现错误', error.message);
        res.status(400).send({error: error.message});
    }
});

// 3.用户获取某个订单
router.get('/user/details/:orderId', async (req, res) => {
    try {
        const order = await OrdersService.getOrderDetails(req.params.orderId);
        res.status(200).send(order);
    } catch (error) {
        console.error('用户获取特定订单status请求时出现错误', error.message);
        res.status(400).send({error: error.message});
    }
});

// ===================================门店操作==================================
// ============================================================================

// 1.门店更新制作中的订单状态
router.patch('/:orderId/status', async (req, res) => {
    try {
        const updateParams = {
            status: req.body.status,
        };
        const updatedOrder = await OrdersService.updateOrder(req.params.orderId, updateParams);
        res.status(200).send(updatedOrder);
    } catch (error) {
        console.error("门店更新制作中的订单状态请求时出现错误",error.message);
        res.status(400).send({error: error.message});
    }
});

// 2.门店获取需要制作的订单
router.get('/admin/store/:storeid/status/:status', async (req, res) => {
    try {
        const orders = await OrdersService.getOrdersByStatusAndStore(req.params.storeid, req.params.status);
        res.status(200).send(orders);
    } catch (error) {
        console.error("门店获取需要制作的订单请求时出现错误",error.message);
        res.status(400).send({error: error.message});
    }
});

// 3.门店获取待制作的订单数量
router.post('/admin/store/:storeid/statuses', async (req, res) => {
    try {
        const storeId = req.params.storeid;
        const {statuses} = req.body; // 从请求体中获取 statuses

        // 检查 statuses 是否是一个数组
        if (!Array.isArray(statuses)) {
            throw new Error('statuses 不是一个数组');
        }

        const orderCounts = await OrdersService.getOrdersNumber(storeId, statuses);

        res.status(200).json(orderCounts);
    } catch (error) {
        console.error("门店获取待制作的订单数量请求时出现错误",error.message);
        res.status(400).json({error: error.message});
    }
});

// 4.超级管理员查询所有订单
router.get('/admin/super/status/', async (req, res) => {
    try {
        const orders = await OrdersService.getOrders();
        res.status(200).send(orders);
    } catch (error) {
        console.error("超级管理员查询所有订单请求时出现错误",error.message);
        res.status(400).send({error: error.message});
    }
});


module.exports = router;