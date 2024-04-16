const express = require('express');
const dishesService = require('../services/dishesService');
const router = express.Router();

// 1.新增菜品
router.post('/create', async (req, res) => {
    try {
        const dishData = req.body;
        const newDish = await dishesService.createDish(dishData);
        res.status(201).json({success: true, dish: newDish});
    } catch (error) {
        console.error('Error creating dish:', error);
        res.status(500).json({success: false, message: 'Error creating dish', error: error.message});
    }
});


// 2.删除菜品
router.delete('/delete/:dishId', async (req, res) => {
    try {
        const {dishId} = req.params;
        await dishesService.deleteDish(dishId);
        res.json({success: true, message: 'Dish deleted successfully'});
    } catch (error) {
        console.error('Error deleting dish:', error);
        res.status(500).json({success: false, message: 'Error deleting dish', error: error.message});
    }
});


// 3.查询所有菜品
router.get('/', async (req, res) => {
    try {
        const dishes = await dishesService.getAllDishes();
        res.json({success: true, dishes});
    } catch (error) {
        console.error('Error getting all dishes:', error);
        res.status(500).json({success: false, message: 'Error getting dishes', error: error.message});
    }
});


// 4.查询门店菜品
router.get('/store-dishes', async (req, res) => {
    try {
        // 提取查询参数
        const params = {
            storeId: req.query.storeId, // 必须有的参数
            serviceType: req.query.serviceType, // 可选参数
            dish_status: req.query.dish_status // 可选参数
        };
        // 过滤查询参数
        Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
        // 使用参数查询
        const storeDishes = await dishesService.getStoreDishes(params);
        res.json({success: true, storeDishes});
    } catch (error) {
        console.error('Error getting store dishes:', error);
        res.status(500).json({success: false, message: 'Error getting store dishes', error: error.message});
    }
});


// 5. 修改门店菜品状态
router.put('/status/:storeId/:dishId/:serviceType', async (req, res) => {
    try {
        const {storeId, dishId, serviceType} = req.params;
        const statusData = req.body;
        const updatedStatus = await dishesService.updateStoreDishStatus(storeId, dishId, serviceType, statusData);
        res.json({success: true, updatedStatus});
    } catch (error) {
        console.error('Error updating dish status:', error);
        res.status(500).json({success: false, message: 'Error updating dish status', error: error.message});
    }
});


// 6.增加菜品销量
router.put('/sales/increment', async (req, res) => {
    try {
        const {dishIds} = req.body;
        await Promise.all(dishIds.map(dishId => dishesService.incrementDishSales(dishId)));
        res.json({success: true}); // 结果不重要，不返回更新后的值
    } catch (error) {
        console.error('Error incrementing dish sales:', error);
        res.status(500).json({success: false, error: error.message});
    }
});


module.exports = router;