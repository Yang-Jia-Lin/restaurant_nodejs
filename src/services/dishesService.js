const Dish = require('../dbModels/dishesModel');
const DishCategory = require('../dbModels/dishCategoriesModel');
const StoreDishStatus = require('../dbModels/storeDishStatusModel');
const storesService = require('./storesService');
const sequelize = require('../config/dbConfig');

const dishesService = {
    // 新增菜品
    createDish: async (dishData) => {
        try {
            return await sequelize.transaction(async (t) => {
                // 1.在菜品总表中新增菜品
                const dish = await Dish.create(dishData, {transaction: t});
                // 2.准备门店菜品信息数据（在每个 store_id 下的 [到店,外卖] 状态各自增加菜品状态记录）
                const storeIds = await storesService.getStoreIds();
                const dishStatuses = []; // 需要新增的记录
                storeIds.forEach(storeId => {
                    ['到店', '外卖'].forEach(serviceType => {
                        dishStatuses.push({
                            store_id: storeId,
                            dish_id: dish.dish_id,
                            serviceType,
                            price: dishData.price,
                            dish_status: '上架',
                        });
                    });
                });
                // 3.在门店菜品状态表中批量新增菜品状态记录
                await StoreDishStatus.bulkCreate(dishStatuses, {transaction: t});
                return dish;
            });
        } catch (error) {
            throw error;
        }
    },

    // 删除菜品
    deleteDish: async (dishId) => {
        try {
            await sequelize.transaction(async (t) => {
                // 1.删除门店状态信息表中的数据
                await StoreDishStatus.destroy({
                    where: {dish_id: dishId},
                    transaction: t
                });
                // 2.删除菜品总表中的数据
                await Dish.destroy({
                    where: {dish_id: dishId},
                    transaction: t
                });
            });
        } catch (error) {
            throw error;
        }
    },

    // 查询所有菜品
    getAllDishes: async () => {
        try {
            return await Dish.findAll({
                include: [{
                    model: DishCategory,
                    as: 'category'
                }],
                order: [
                    ['category_id', 'ASC'],
                    ['sales', 'DESC']
                ]
            });
        } catch (error) {
            throw error;
        }
    },

    // 查询门店菜品
    getStoreDishes: async (params) => {
        try {
            // 构建基础查询条件，其中storeId是必须的
            if (params.storeId === undefined) {
                throw new Error('storeId is required');
            }
            let whereCondition = {
                store_id: params.storeId,
            };
            // 添加其他查询条件
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
        } catch (error) {
            throw error;
        }
    },

    // 修改门店菜品状态
    updateStoreDishStatus: async (storeId, dishId, serviceType, statusData) => {
        try {
            return StoreDishStatus.update(statusData, {
                where: {
                    store_id: storeId,
                    dish_id: dishId,
                    serviceType: serviceType
                }
            });
        } catch (error) {
            throw error;
        }
    },

    // 增加菜品销量
    incrementDishSales: async (dishId) => {
        try {
            await Dish.increment('sales', { by: 2, where: { dish_id: dishId } });
        } catch (error) {
            throw error;
        }
    }
};


module.exports = dishesService;