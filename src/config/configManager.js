// 自动打印设置
let shouldPrintOrders = true; // 默认启用打印

// setter and getter
const setShouldPrintOrders = (value) => {
    shouldPrintOrders = value;
};
const getShouldPrintOrders = () => shouldPrintOrders;

module.exports = {
    setShouldPrintOrders,
    getShouldPrintOrders,
};