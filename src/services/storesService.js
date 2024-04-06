const Store = require('../dbModels/storesModel');
const sequelize = require('../config/dbConfig');

// 1. 添加门店信息
async function createStore(storeData) {
    try {
        const newStore = await Store.create(storeData);
        return newStore;
    } catch (error) {
        console.error('Error creating store:', error);
        throw error;
    }
}

// 2. 获取门店信息
async function getStoreById(storeId) {
    try {
        const store = await Store.findByPk(storeId);
        if (!store) {
            throw new Error('Store not found');
        }
        return store;
    } catch (error) {
        console.error('Error finding store:', error);
        throw error;
    }
}

async function getStoreIds() {
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
        console.error('Error getting all storeIds:', error);
        throw error;
    }
}

async function getAllStores() {
    try {
        const stores = await Store.findAll();
        return stores;
    } catch (error) {
        console.error('Error getting all stores:', error);
        throw error;
    }
}

async function getAllStoresSortedByDistance(latitude, longitude) {
    const haversine = `(6371 * acos(cos(radians(${latitude})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${longitude})) + sin(radians(${latitude})) * sin(radians(latitude))))`;
    try {
        const stores = await Store.findAll({
            attributes: {
                include: [[sequelize.literal(haversine), 'distance']]
            },
            order: sequelize.literal('distance ASC')
        });
        return stores;
    } catch (error) {
        console.error('Error getting all stores sorted by distance:', error);
        throw error;
    }
}

// 3. 修改门店信息
async function updateStore(storeId, updateData) {
    try {
        const [updated] = await Store.update(updateData, {
            where: { store_id: storeId }
        });
        if (updated) {
            const updatedStore = await Store.findByPk(storeId);
            return updatedStore;
        }
        throw new Error('Store not found');
    } catch (error) {
        console.error('Error updating store:', error);
        throw error;
    }
}

// 4. 删除门店信息
async function deleteStore(storeId) {
    try {
        const deleted = await Store.destroy({
            where: { store_id: storeId }
        });
        if (deleted) {
            return { message: 'Store deleted successfully' };
        }
        throw new Error('Store not found');
    } catch (error) {
        console.error('Error deleting store:', error);
        throw error;
    }
}

// 导出服务方法供控制层使用
module.exports = {
    createStore,
    getStoreById,
    getStoreIds,
    getAllStores,
    getAllStoresSortedByDistance,
    updateStore,
    deleteStore
};