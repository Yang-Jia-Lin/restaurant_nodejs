const express = require('express');
const dishesService = require('../services/dishesService');
const router = express.Router();

// 1. 创建新菜品并在每个门店中添加对应状态
router.post('/', async (req, res) => {
    try {
        const dishData = req.body;
        const newDish = await dishesService.createDish(dishData);
        res.status(201).json({ success: true, dish: newDish });
    } catch (error) {
        console.error('Error creating dish:', error);
        res.status(500).json({ success: false, message: 'Error creating dish', error: error.message });
    }
});

// 2. 删除菜品及其在门店中的状态
router.delete('/:dishId', async (req, res) => {
    try {
        const { dishId } = req.params;
        await dishesService.deleteDish(dishId);
        res.json({ success: true, message: 'Dish deleted successfully' });
    } catch (error) {
        console.error('Error deleting dish:', error);
        res.status(500).json({ success: false, message: 'Error deleting dish', error: error.message });
    }
});

// 3. 查询所有菜品，按分类和销量排序
router.get('/', async (req, res) => {
    try {
        const dishes = await dishesService.getAllDishesSorted();
        res.json({ success: true, dishes });
    } catch (error) {
        console.error('Error getting dishes:', error);
        res.status(500).json({ success: false, message: 'Error getting dishes', error: error.message });
    }
});

// 4. 查询某门店的菜品状态，根据提供的任意参数进行查询
router.get('/store-dishes', async (req, res) => {
    try {
        // 从请求中提取所有可能的查询参数
        const params = {
            storeId: req.query.storeId, // 必须有的参数
            serviceType: req.query.serviceType, // 可选参数
            dish_status: req.query.dish_status // 可选参数
        };

        // 过滤掉未定义的查询参数
        Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

        // 使用提供的参数调用服务层函数
        const storeDishes = await dishesService.getStoreDishes(params);
        res.json({ success: true, storeDishes });
    } catch (error) {
        console.error('Error getting store dishes:', error);
        res.status(500).json({ success: false, message: 'Error getting store dishes', error: error.message });
    }
});

// 5. 修改某门店的菜品状态
router.put('/status/:storeId/:dishId/:serviceType', async (req, res) => {
    try {
        const { storeId, dishId, serviceType } = req.params;
        const statusData = req.body;
        const updatedStatus = await dishesService.updateStoreDishStatus(storeId, dishId, serviceType, statusData);
        res.json({ success: true, updatedStatus });
    } catch (error) {
        console.error('Error updating dish status:', error);
        res.status(500).json({ success: false, message: 'Error updating dish status', error: error.message });
    }
});

// 6. 增加多个菜品销量
router.put('/sales/increment', async (req, res) => {
    try {
        // 从请求体中获取 dishIds 数组
        const { dishIds } = req.body;

        // 对每个 dishId 调用 incrementDishSales 并等待所有的更新完成
        const updatedDishes = await Promise.all(dishIds.map(dishId => dishesService.incrementDishSales(dishId)));

        res.json({ success: true, updatedDishes });
    } catch (error) {
        console.error('Error incrementing dish sales:', error);
        res.status(500).json({ success: false, message: 'Error incrementing dish sales', error: error.message });
    }
});


// 导出路由
module.exports = router;