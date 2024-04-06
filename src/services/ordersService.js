const Order = require('../dbModels/ordersModel');
const OrderDetail = require('../dbModels/orderDetailsModel');
const PickupService = require('./pickupService');
const PrintingService = require('./printingService');
const { getShouldPrintOrders } = require('../config/configManager');

const { Op } = require('sequelize');

class OrdersService {


    // ===============================支付与创建修改操作==================================
    // ============================================================================

    // 1.创建待支付订单（支付预处理时调用）
    static async createOrder(orderData, orderDetails) {
        const transaction = await Order.sequelize.transaction();
        try {
            const order = await Order.create(orderData, { transaction });
            const details = orderDetails.map(detail => ({
                ...detail,
                order_id: order.order_id
            }));
            await OrderDetail.bulkCreate(details, { transaction });
            await transaction.commit();
            return order;
        } catch (error) {
            await transaction.rollback();
            console.error("创建订单失败:", error);
            throw error;
        }
    }


    // 2.处理支付完成订单（支付回调后调用）
    static async processPaidOrder(orderId) {
        try {
            // 2.1 更新订单状态
            const order = await this.getOrderById(orderId);
            if (!order) {
                console.error(`订单未找到 - 订单ID: ${orderId}`);
                return { success: false, message: '订单未找到' };
            }
            await this.updateOrderStatus(order, { status: '等待中' });  // 非常重要，直接抛出异常，可以重试

            // 2.2 制作/排队
            const makeResult = order.dataValues.delivery_type === '立即' ?
                await this.beginMakeOrder(order) : { success: true, message: '订单等待处理' };
            return makeResult;
        } catch (err) {
            console.error(`订单处理失败 - 订单ID: ${orderId}, 错误: ${err.message}`, err);
            return { success: false, status: 500, message: '订单处理失败' };
        }
    }
    static async updateOrderStatus(order, { status, pickupNumber, pickupId }) {
        try {
            const updateData = { order_status: status };
            if (pickupNumber) {
                updateData.pickup_number = pickupNumber;
                updateData.pickup_id = pickupId;
            }
            await order.update(updateData);
        } catch (error) {
            console.error(`更新订单状态失败 - 订单ID: ${order.id}, 错误: ${error.message}`, error);
            throw error;
        }
    }
    // 开始制作（状态：等待→制作）
    static async beginMakeOrder(order) {
        try {
            const pickupInfo = await PickupService.incrementPickupNumber(order.dataValues.store_id);
            const pickupNumber = pickupInfo.previousPickupNumber;
            const pickupId = pickupInfo.previousPickupId;

            if (order.dataValues.order_status === '等待中') {
                await this.updateOrderStatus(order, { status: '制作中', pickupNumber: pickupNumber, pickupId: pickupId });
                if (getShouldPrintOrders()) {
                    const printingService = new PrintingService();
                    const orderDetail = await this.getOrderByOrderId(order.order_id);
                    printingService.printOrder(orderDetail, 1); // 传入订单内容和打印次数
                }
                return { success: true, status: 200, message: '订单排号成功' };
            } else {
                return { success: false, status: 500, message: '订单排号失败' };
            }

        } catch (err) {
            console.error('订单排号失败', err);
            return { success: false, status: 500, message: '订单排号失败' };
        }
    }








    // ===============================定期扫描操作==================================
    // ============================================================================
    // 扫描等待中订单
    static async scanAndProcessOrders() {
        try {
            const orders = await this.getOrdersToProcess();
            for (const order of orders) {
                const currentTime = new Date();
                const deliveryTime = new Date(order.delivery_time);
                const timeDiff = deliveryTime.getTime() - currentTime.getTime();

                // 如果当前时间接近或超过预约时间，则开始制作
                if (order.order_status === '等待中' && order.order_type === '到店' && timeDiff <= 6 * 60 * 1000) {
                    await this.beginMakeOrder(order);
                } else if (order.order_status === '等待中' && order.order_type === '外卖' && timeDiff <= 30 * 60 * 1000) {
                    await this.beginMakeOrder(order);
                }
            }
        } catch (err) {
            console.error('扫描订单失败', err);
        }
    }
    // 获取等待处理的订单
    static async getOrdersToProcess() {
        return await Order.findAll({
            where: { order_status: '等待中' },
        });
    }








    // ==================================用户操作==================================
    // ============================================================================
    // 查询全部订单
    static async getOrdersByUserId(userId) {
        return await Order.findAll({
            where: { user_id: userId },
            include: [{
                model: OrderDetail,
                as: 'orderDetails'
            }],
            order: [
                ['order_time', 'DESC']
            ],
        	  limit: 50
        });
    }
    // 查询特定状态订单
    static async getOrdersByUserIdAndStatus(userId, order_status) {
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
            limit:10
        });
    }
    // 查询订单详情
    static async getOrderByOrderId(orderId) {
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
    }
    // 仅查询订单
    static async getOrderById(orderId) {
        const order = await Order.findByPk(orderId);
        if (!order) {
            throw new Error('Order not found');
        }
        return order;
    }




    // ==================================门店操作==================================
    // ============================================================================
    // 修改订单状态
    static async updateOrder(orderId, { status }) {
        try {
            const order = await Order.findByPk(orderId);
            if (!order) {
                throw new Error(`订单未找到-ID: ${orderId}`);
            }
            const updateData = { order_status: status };
            await order.update(updateData);
        } catch (error) {
            console.error(`订单更新失败-ID: ${orderId}`, error);
            throw error;
        }
    }
    // 查询特定状态订单
    static async getOrdersByStatusAndStore(store_id, status) {
        return await Order.findAll({
            where: {
                store_id: store_id,
                order_status: status
            },
            include: [{
                model: OrderDetail,
                as: 'orderDetails'
            }]
            ,
            order: [
                ['pickup_id', 'ASC'],
                ['order_time', 'ASC'],
            ],
            limit:50
        });
    }

    // 查询一些状态订单的数量
    static async getOrdersNumber(store_id, statusList) {
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
    }


    // 超级管理员查询所有订单
    static async getOrders() {
        return await Order.findAll({
            include: [{
                model: OrderDetail,
                as: 'orderDetails'
            }]
            ,
            order: [
                ['pickup_id', 'DESC'],
                ['order_time', 'DESC'],
            ],
            limit:50
        });
    }
}

module.exports = OrdersService;