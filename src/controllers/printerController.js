const express = require('express');
const PrintingService = require('../services/printingService');
const router = express.Router();

// 打印订单
router.post('/', async (req, res) => {
    try {
        const { order } = req.body;
        await PrintingService.printOrder(order, 1);
        res.json({ success: true, message: '订单已经提交打印' });
    } catch (error) {
        console.error('Error printing order:', error);
        res.status(500).json({ success: false, message: '打印订单失败', error });
    }
});

module.exports = router;
