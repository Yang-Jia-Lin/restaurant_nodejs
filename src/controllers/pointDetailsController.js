const express = require('express');
const router = express.Router();
const pointDetailsService = require('../services/pointDetailsService');

// 添加积点到用户
router.put('/add/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { pointsToAdd, issueType } = req.body;

        // 输入验证
        const points = parseFloat(pointsToAdd);
        if (!userId || isNaN(points)) {
            return res.status(400).json({ success: false, message: 'Invalid input' });
        }

        // 更新积点
        const { updatedUser, pointDetail } = await pointDetailsService.addUserPoints(userId, points, issueType);

        res.json({ success: true, updatedUser, pointDetail });
    } catch (error) {
        console.error('Error adding points to user:', error);
        res.status(500).json({ success: false, message: 'Error adding points to user', error });
    }
});

// 获取用户积点明细
router.get('/details/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const points = await pointDetailsService.getPointsByUserId(userId);
        res.json({ success: true, points });
    } catch (error) {
        console.error('Error retrieving points details:', error);
        res.status(500).json({ success: false, message: 'Error retrieving points details', error });
    }
});

module.exports = router;
