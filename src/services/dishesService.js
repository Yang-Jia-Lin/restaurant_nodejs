const Dish = require('../dbModels/dishesModel');
const DishCategory = require('../dbModels/dishCategoriesModel');
const StoreDishStatus = require('../dbModels/storeDishStatusModel');
const storesService = require('./storesService');
const sequelize = require('../config/dbConfig');

// 1. 创建菜品并在每个门店中添加两种服务类型的状态
async function createDish(dishData) {
    let newDish = await sequelize.transaction(async (t) => {
        const dish = await Dish.create(dishData, { transaction: t });

        const storeIds = await storesService.getStoreIds();
        const dishStatuses = [];
        storeIds.forEach(storeId => {
            ['到店', '外卖'].forEach(serviceType => {
                dishStatuses.push({
                    store_id: storeId,
                    dish_id: dish.dish_id,
                    serviceType,
                    price: dishData.price,
                    dish_status: '下架',
                });
            });
        });

        await StoreDishStatus.bulkCreate(dishStatuses, { transaction: t });
        return dish;
    });
    return newDish;
}

// 2. 删除菜品及其在门店中的状态
async function deleteDish(dishId) {
    await sequelize.transaction(async (t) => {
        await StoreDishStatus.destroy({
            where: { dish_id: dishId },
            transaction: t
        });
        await Dish.destroy({
            where: { dish_id: dishId },
            transaction: t
        });
    });
}

// 3. 查询所有菜品，按分类和销量排序
async function getAllDishesSorted() {
    return Dish.findAll({
        include: [{
            model: DishCategory,
            as: 'category'
        }],
        order: [
            ['category_id', 'ASC'],
            ['sales', 'DESC']
        ]
    });
}

// 4. 查询某门店的菜品状态，按分类和销量排序
async function getStoreDishes(params) {
    // 构建基础查询条件，storeId是必须的
    let whereCondition = {
        store_id: params.storeId,
    };

    // 动态添加其他查询条件
    if (params.serviceType) {
        whereCondition.serviceType = params.serviceType;
    }
    if (params.dish_status) {
        whereCondition.dish_status = params.dish_status;
    }

    return StoreDishStatus.findAll({
        where: whereCondition,
        include: [{
            model: Dish,
            as: 'dish',
            include: [{
                model: DishCategory,
                as: 'category'
            }]
        }],

    });
}

// 5. 修改某门店的菜品状态
async function updateStoreDishStatus(storeId, dishId, serviceType, statusData) {
    return StoreDishStatus.update(statusData, {
        where: {
            store_id: storeId,
            dish_id: dishId,
            serviceType: serviceType
        }
    });
}

// 6. 更新菜品销量+1
async function incrementDishSales(dishId) {
    try {
        const dish = await Dish.findByPk(dishId);
        if (!dish) {
            throw new Error('Dish not found');
        }
        await Dish.increment('sales', { by: 1, where: { dish_id: dishId } });
        return await Dish.findByPk(dishId);
    } catch (error) {
        console.error('Error incrementing dish sales:', error);
        throw error;
    }
}

module.exports = {
    createDish,
    deleteDish,
    getAllDishesSorted,
    getStoreDishes,
    updateStoreDishStatus,
    incrementDishSales
};
