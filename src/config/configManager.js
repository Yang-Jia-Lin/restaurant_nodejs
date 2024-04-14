let shouldPrintOrders = true; // 默认启用打印

const setShouldPrintOrders = (value) => {
    shouldPrintOrders = value;
};

const getShouldPrintOrders = () => shouldPrintOrders;

module.exports = {
    setShouldPrintOrders,
    getShouldPrintOrders,
};
