const Order = require('../dbModels/ordersModel');
const OrderDetail = require('../dbModels/orderDetailsModel');
const PickupService = require('./pickupService');
const PrintingService = require('./printingService');
const {getShouldPrintOrders} = require('../config/configManager');

const {Sequelize} = require("sequelize");

const OrdersService = {

    // ===============================订单基础增删改查操作=============================
    // ============================================================================

    // 1.创建待支付订单
    createOrder: async (orderData, orderDetails) => {
        const transaction = await Order.sequelize.transaction();
        try {
            const order = await Order.create(orderData, {transaction});
            const details = orderDetails.map(detail => ({
                ...detail,
                order_id: order.order_id
            }));
            await OrderDetail.bulkCreate(details, {transaction});
            await transaction.commit();
            return order;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    // 2.修改订单状态
    updateOrderStatus: async (order, {status, pickupNumber, pickupId}) => {
        try {
            const updateData = {order_status: status};
            if (pickupNumber) {
                updateData.pickup_number = pickupNumber;
                updateData.pickup_id = pickupId;
            }
            await order.update(updateData);
        } catch (error) {
            throw error;
        }
    },

    // 3.查找特定订单（不含有详情）
    getOrderById: async (orderId) => {
        try {
            const order = await Order.findByPk(orderId);
            if (!order) {
                throw new Error('Order not found');
            }
            return order;
        } catch (error) {
            throw error;
        }
    },
    //（含有详情）
    getOrderDetails: async (orderId) => {
        const order = await Order.findByPk(orderId, {
            include: [{
                model: OrderDetail,
                as: 'orderDetails'
            }]
        });
        if (!order) {
            throw new Error('Order not found');
        }
        return order;
    },


    // ===============================订单支付相关操作==================================
    // ============================================================================

    // 1.处理支付完成订单（完成支付回调后）
    processPaidOrder: async (orderId) => {
        try {
            // 更新订单状态
            const order = await OrdersService.getOrderById(orderId);
            await OrdersService.updateOrderStatus(order, {status: '等待中'});

            // 根据订单参数判断是否立即制作
            if (order.dataValues.delivery_type === '立即') {
                await OrdersService.beginMakeOrder(order);
            }
        } catch (error) {
            throw error;
        }
    },

    // 2.开始制作订单
    beginMakeOrder: async (order) => {
        try {
            // 检查订单状态
            console.log("@@beginMakeOrder",order);
            if (order.order_status !== '等待中'){
                throw new Error('订单状态错误，无法开始制作');
            }

            // 获取排号并更新订单状态
            const pickupInfo = await PickupService.incrementPickupNumber(order.dataValues.store_id);
            const pickupNumber = pickupInfo.previousPickupNumber;
            const pickupId = pickupInfo.previousPickupId;
            await OrdersService.updateOrderStatus(order, {
                status: '制作中',
                pickupNumber: pickupNumber,
                pickupId: pickupId
            });

            // 根据情况打印小票
            if (getShouldPrintOrders()) {
                const orderDetail = await OrdersService.getOrderDetails(order.order_id);
                await PrintingService.printOrder(orderDetail, 1);    // 打印订单异步执行即可，无需等待打印完成才能排号
            }
        } catch (error) {
            console.error("beginMakeOrder error",error);
            throw error;
        }
    },

    // 3.定时扫描订单并处理
    scanAndProcessOrders: async () => {
        try {
            const orders = await Order.findAll({where: {order_status: '等待中'},});
            const promises = orders.map(order => {
                const currentTime = new Date();
                const deliveryTime = new Date(order.delivery_time);
                const timeDiff = deliveryTime.getTime() - currentTime.getTime();

                if (order.order_type === '到店' && timeDiff <= 6 * 60 * 1000) {
                    return OrdersService.beginMakeOrder(order);
                } else if (order.order_type === '外卖' && timeDiff <= 30 * 60 * 1000) {
                    return OrdersService.beginMakeOrder(order);
                }
            });
            await Promise.all(promises);
        } catch (err) {
            throw err;
        }
    },


    // ==================================用户操作==================================
    // ===========================================================================

    // 1.用户获取所有订单
    getOrdersByUserId: async (userId) => {
        return await Order.findAll({
            where: {user_id: userId},
            include: [{
                model: OrderDetail,
                as: 'orderDetails'
            }],
            order: [
                ['order_time', 'DESC']
            ],
            limit: 50
        });
    },

    // 2.用户获取特定订单
    getOrdersByUserIdAndStatus: async (userId, order_status) => {
        return await Order.findAll({
            where: {
                user_id: userId,
                order_status: order_status
            },
            include: [{
                model: OrderDetail,
                as: 'orderDetails'
            }],
            order: [['order_time', 'DESC']],
            limit: 10
        });
    },

    // 3.修改等待中的订单deliverTime
    changeDeliverTime: async(orderId, deliverTime) => {
        if (!(deliverTime instanceof Date)) {
            throw new Error('deliverTime必须是一个有效的Date对象');
        }

        try {
            const order = await Order.findOne({
                where: { order_id: orderId }
            });

            if (!order) {
                throw new Error('未找到指定的订单');
            }

            if (order.order_status !== '等待中') {
                throw new Error('订单状态不是等待中，无法修改送达时间');
            }

            order.delivery_time = deliverTime;
            await order.save();
            return order;
        } catch (error) {
            console.error('更新送达时间失败:', error);
            throw error;
        }
    },

    // 4.用户查询订单进度
    getQueueNum: async(pickId) => {
        try {
            if (pickId === 0) {
                const maxPickupId = await Order.max('pickup_id');
                pickId = maxPickupId || 0;  // 如果没有订单，则默认为 0
            }
            return await Order.count({
                where: {
                    order_status: '制作中',
                    pickup_id: {
                        [Sequelize.Op.lt]: pickId  // 使用 Op.lt 操作符比较
                    }
                }
            }); // 返回计算出的数量
        } catch (error) {
            console.error('查询排队订单失败:', error);
            throw error;
        }
    },


    // ==================================门店操作==================================
    // ===========================================================================

    // 1.门店更新制作中的订单状态
    updateOrder: async (orderId, {status}) => {
        try {
            const order = await Order.findByPk(orderId);
            const updateData = {order_status: status};
            await order.update(updateData);
        } catch (error) {
            throw error;
        }
    },

    // 2.门店获取需要制作的订单
    getOrdersByStatusAndStore: async (store_id, status) => {
        return await Order.findAll({
            where: {
                store_id: store_id,
                order_status: status
            },
            include: [{
                model: OrderDetail,
                as: 'orderDetails'
            }],
            order: [
                ['pickup_id', 'ASC'],
                ['order_time', 'ASC'],
            ],
            limit: 50
        });
    },

    // 3.门店获取待制作的订单数量
    getOrdersNumber: async (store_id, statusList) => {
        let orderCounts = {};
        for (let status of statusList) {
            orderCounts[status] = await Order.count({
                where: {
                    store_id: store_id,
                    order_status: status
                }
            });
        }
        return orderCounts;
    },

    // 4.超级管理员获取所有订单
    getOrders: async () => {
        return await Order.findAll({
            include: [{
                model: OrderDetail,
                as: 'orderDetails'
            }],
            order: [
                ['pickup_id', 'DESC'],
                ['order_time', 'DESC'],
            ],
            limit: 50
        });
    }
};


module.exports = OrdersService;