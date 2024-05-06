const express = require('express');
const storesService = require('../services/storesService');
const router = express.Router();

// 1.添加门店
router.post('/', async (req, res) => {
    try {
        const newStore = await storesService.createStore(req.body);
        res.status(201).json({ success: true, store: newStore });
    } catch (error) {
        console.error('Error creating store:', error);
        res.status(500).json({ success: false, message: 'Error creating store', error: error.message });
    }
});


// 2.获取特定门店
router.get('/:storeId', async (req, res) => {
    try {
        const { storeId } = req.params;
        const store = await storesService.getStoreById(storeId);
        res.json({ success: true, store });
    } catch (error) {
        console.error('Error finding store:', error);
        res.status(404).json({ success: false, message: 'Store not found', error: error.message });
    }
});


// 3. 获取所有门店，如果提供了经纬度参数则按照距离排序
router.get('/', async (req, res) => {
    try {
        const { latitude, longitude } = req.query;
        // 验证 经纬度是安全的字符串，防止SQL注入
        if ((latitude && !latitude.match(/^-?\d+\.\d+$/)) ||
            (longitude && !longitude.match(/^-?\d+\.\d+$/))) {
            throw new Error('Invalid input for latitude or longitude');
        }
        let stores;
        if (latitude && longitude) {
            // 如果有经纬度参数，按照距离排序
            stores = await storesService.getAllStoresSortedByDistance(latitude, longitude);
        } else {
            // 没有经纬度参数，直接返回所有门店
            stores = await storesService.getAllStores();
        }

        res.json({ success: true, stores });
    } catch (error) {
        console.error('Error getting stores:', error);
        res.status(500).json({ success: false, message: 'Error getting stores', error: error.message });
    }
});


// 4.修改门店状态
router.put('/:storeId', async (req, res) => {
    try {
        const { storeId } = req.params;
        const updateData = req.body;
        const updatedStore = await storesService.updateStore(storeId, updateData);
        res.json({ success: true, updatedStore });
    } catch (error) {
        console.error('Error updating store:', error);
        res.status(500).json({ success: false, message: 'Error updating store', error: error.message });
    }
});


// 5.删除门店信息
router.delete('/:storeId', async (req, res) => {
    try {
        const { storeId } = req.params;
        await storesService.deleteStore(storeId);
        res.json({ success: true, message: 'Store deleted successfully' });
    } catch (error) {
        console.error('Error deleting store:', error);
        res.status(500).json({ success: false, message: 'Error deleting store', error: error.message });
    }
});

// 6.获取门店时间表
router.get('/:storeId/timeSlots', async (req, res) => {
    try {
        const { storeId } = req.params;
        const storeWithTimeSlots = await storesService.getStoreWithTimeSlots(storeId);
        if (!storeWithTimeSlots || !storeWithTimeSlots.timeSlots.length) { // 检查是否真的有时间槽数据返回
            res.status(404).json({ success: false, message: 'Store with specified time slots not found' });
        } else {
            res.json({
                success: true,
                lastUpdated: storeWithTimeSlots.lastUpdated, // 传递最后更新时间
                timeSlots: storeWithTimeSlots.timeSlots // 传递时间槽数组
            });
        }
    } catch (error) {
        console.error('Error retrieving store with time slots:', error);
        res.status(500).json({ success: false, message: 'Error retrieving store with time slots', error: error.message });
    }
});

// 导出路由
module.exports = router;
