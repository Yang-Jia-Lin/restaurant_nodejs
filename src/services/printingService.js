require('dotenv').config();
const appId = "sp65c4ca333fa1f";
const appSecret = "74a7972c1de88cd6ad9c9b37b9d44be4";
const printerId = "1552501851";
const Api = require('../lib/api');

// 预处理订单数据
function prepareOrderContent(order) {
    const orderTime = new Date(order.order_time).toLocaleString('zh-CN', { hour12: false });
    const deliveryTime = order.delivery_type === '立即' ? '立即送出' :
        new Date(order.delivery_time).toLocaleString('zh-CN', { hour12: false });

    const dishesString = order.orderDetails.map(detail =>
        `<H><B>${detail.dish_name} ×${detail.quantity}</B></H><BR>`
    ).join('');

    return `<C><L1>唐合丰粉面馆</L1></C><BR><C><L2>${order.order_type}${order.pickup_number}号</L2></C><C>--------------------------------</C>期望送达时间：${deliveryTime}<BR>下单时间：${orderTime}<BR><C>--------------------------------</C>${dishesString}<C>--------------------------------</C> <L1>${order.address}</L1> <BR><L1>${order.call_name}</L1> <BR><L1>${order.phone}</L1>`;
}

// 打印服务层
const printingService = {
    printerApi: new Api(appId, appSecret),
    printOrder: async (order, times) => {
        try {
            const content = prepareOrderContent(order);
            await printingService.printerApi.print(printerId, content, times);
        } catch (error) {
            throw error;
        }
    }
};

module.exports = printingService;
