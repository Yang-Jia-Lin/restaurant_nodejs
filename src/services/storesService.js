const Store = require('../dbModels/storesModel');
const sequelize = require('../config/dbConfig');

const storeService = {

    // 1. 添加门店信息
    createStore: async (storeData) => {
        try {
            return await Store.create(storeData);
        } catch (error) {
            throw error;
        }
    },


    // 2. 获取门店信息
    getStoreById: async (storeId) => {
        try {
            const store = await Store.findByPk(storeId);
            if (!store) {
                throw new Error('Store not found');
            }
            return store;
        } catch (error) {
            throw error;
        }
    },
    getStoreIds: async () => {
        try {
            const stores = await Store.findAll({
                attributes: ['store_id'] // 仅查询store_id
            });
            if (!stores) {
                throw new Error('Stores not found');
            }
            // 提取store_id并返回一个数组
            return stores.map(store => store.store_id);
        } catch (error) {
            throw error;
        }
    },
    getAllStores: async () => {
        try {
            return await Store.findAll();
        } catch (error) {
            throw error;
        }
    },
    getAllStoresSortedByDistance: async (latitude, longitude) => {
        const haversine = `(6371 * acos(cos(radians(${latitude})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${longitude})) + sin(radians(${latitude})) * sin(radians(latitude))))`;
        try {
            return await Store.findAll({
                attributes: {
                    include: [[sequelize.literal(haversine), 'distance']]
                },
                order: sequelize.literal('distance ASC')
            });
        } catch (error) {
            throw error;
        }
    },


    // 3. 修改门店信息
    updateStore: async (storeId, updateData) => {
        try {
            const [updated] = await Store.update(updateData, { where: { store_id: storeId }});
            if (!updated) {
               throw new Error('No store found with the provided ID or no changes were made');
            }
            return await Store.findByPk(storeId);
        } catch (error) {
            throw error;
        }
    },


    // 4. 删除门店信息
    deleteStore: async (storeId) => {
        try {
            const deleted = await Store.destroy({
                where: { store_id: storeId }
            });
            if (!deleted) {
                throw new Error('Store not found');
            }
            return { message: 'Store deleted successfully' };
        } catch (error) {
            throw error;
        }
    }
};

module.exports = storeService;
