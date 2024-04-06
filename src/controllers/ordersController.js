const express = require('express');
const OrdersService = require('../services/ordersService');
const router = express.Router();



router.patch('/:orderId/begin-make', async (req, res) => {
    try {
        const orderId = req.params.orderId;
        // 首先获取订单对象
        const order = await OrdersService.getOrderById(orderId);
        if (!order) {
            res.status(404).send({ error: '订单未找到' });
            return;
        }

        // 调用beginMakeOrder
        const result = await OrdersService.beginMakeOrder(order);

        if (result.success) {
            res.status(200).send({ message: result.message });
        } else {
            res.status(400).send({ error: result.message });
        }
    } catch (error) {
        console.error('处理订单请求时出现错误', error);
        res.status(500).send({ error: '服务器内部错误' });
    }
});



// ===================================用户操作==================================
// ============================================================================
// 查询全部订单
router.get('/user/:userId', async (req, res) => {
    try {
        const orders = await OrdersService.getOrdersByUserId(req.params.userId);
        res.status(200).send(orders);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});
// 查询特定状态订单
router.get('/user/:userId/status/:status', async (req, res) => {
    try {
        const orders = await OrdersService.getOrdersByUserIdAndStatus(req.params.userId, req.params.status);
        res.status(200).send(orders);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});
// 查询订单详情
router.get('/user/details/:orderId', async (req, res) => {
    try {
        const order = await OrdersService.getOrderByOrderId(req.params.orderId);
        res.status(200).send(order);
    } catch (error) {
        res.status(404).send({ error: error.message });
    }
});



// ===================================门店操作==================================
// ============================================================================

// 修改订单状态
router.patch('/:orderId/status', async (req, res) => {
    try {
        const updateParams = {
            status: req.body.status,
        };
        const updatedOrder = await OrdersService.updateOrder(req.params.orderId, updateParams);
        res.status(200).send(updatedOrder);
    } catch (error) {
        console.error(error)
        res.status(400).send({ error: error.message });
    }
});
// 查询特定状态订单
router.get('/admin/store/:storeid/status/:status', async (req, res) => {
    try {
        const orders = await OrdersService.getOrdersByStatusAndStore(req.params.storeid, req.params.status);
        res.status(200).send(orders);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});
router.post('/admin/store/:storeid/statuses', async (req, res) => {
    try {
        const storeId = req.params.storeid;
        const { statuses } = req.body; // 从请求体中获取 statuses

        // 检查 statuses 是否是一个数组
        if (!Array.isArray(statuses)) {
            return res.status(400).json({ error: "statusList is not iterable" });
        }

        const orderCounts = await OrdersService.getOrdersNumber(storeId, statuses);

        res.status(200).json(orderCounts);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// 超级管理员查询所有订单
router.get('/admin/super/status/', async (req, res) => {
    try {
        const orders = await OrdersService.getOrders();
        res.status(200).send(orders);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});


module.exports = router;