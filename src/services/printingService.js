// printingService.js

const Api = require('../lib/api');

class PrintingService {
    constructor() {
        this.appid = 'sp65c4ca333fa1f';
        this.appsecret = '74a7972c1de88cd6ad9c9b37b9d44be4';
        this.defaultPrinterId = '1552501851'; // 打印机编号
        this.printerApi = new Api(this.appid, this.appsecret);
    }

    async printOrder(order, times) {
        const content = this.prepareOrderContent(order); // 准备订单内容
        const printerId = this.defaultPrinterId;
        try {
            const result = await this.printerApi.print(printerId, content, times);
            console.log(result);
            return result;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    prepareOrderContent(order) {
        // 格式化时间
        let deliveryTime = '';
        const orderTime = new Date(order.order_time).toLocaleString('zh-CN', { hour12: false });
        if (order.delivery_type === '立即') {
            deliveryTime = '立即送达';
        } else {
            deliveryTime = new Date(order.delivery_time).toLocaleString('zh-CN', { hour12: false });
        }

        // 先提取orderDetails中的菜品信息
        let dishesString = '';
        order.orderDetails.forEach(detail => {
            dishesString += `<H><B>${detail.dish_name} ×${detail.quantity}</B></H><BR>`;
        });
        
        return `<C><L1>唐合丰粉面馆</L1></C><BR><C><L2>${order.order_type}${order.pickup_number}号</L2></C><C>--------------------------------</C>期望送达时间：${deliveryTime}<BR>下单时间：${orderTime}<BR><C>--------------------------------</C>${dishesString}<C>--------------------------------</C> <L1>${order.address}</L1> <BR><L1>${order.call_name}</L1> <BR><L1>${order.phone}</L1>`;
    }
}

module.exports = PrintingService;
