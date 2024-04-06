const express = require('express');
const { getShouldPrintOrders, setShouldPrintOrders } = require('../config/configManager');
const router = express.Router();

// 处理GET请求，获取当前的打印偏好
router.get('/get', (req, res) => {
    const shouldPrint = getShouldPrintOrders();
    res.send({ success: true, shouldPrint });
});

// 处理POST请求，更新打印偏好
router.post('/set', (req, res) => {
    const { shouldPrint } = req.body;
    setShouldPrintOrders(shouldPrint);
    res.send({ success: true, message: '打印偏好设置成功' });
});

module.exports = router;
