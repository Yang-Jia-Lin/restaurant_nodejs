const Store = require('../dbModels/storesModel');
const StoreTimeSlot = require('../dbModels/storeTimeModel');
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
    },

    // 5. 获取门店时间信息
    getStoreWithTimeSlots: async (storeId) => {
        try {
            const isWeekendOrHoliday = isHolidayOrWeekend();  // 调用判断周末或节假日的函数
            const storeWithSlots = await Store.findByPk(storeId, {
                include: [{
                    model: StoreTimeSlot,
                    as: 'timeSlots',
                    where: {
                        daily: !isWeekendOrHoliday  // 根据是否为周末或节假日来动态调整查询条件
                    },
                    attributes: ['time_slot','time_status']  // 仅查询 time_slot 字段
                }],
                attributes: ['last_updated']
            });
            if (!storeWithSlots || !storeWithSlots.timeSlots) {
                throw new Error('Store not found or no time slots available');
            }

            return {
                lastUpdated: storeWithSlots.last_updated,
                timeSlots: storeWithSlots.timeSlots
            };
        } catch (error) {
            throw error;
        }
    }
};

// 日期判断
function isHolidayOrWeekend() {
    const today = new Date();
    const dayOfWeek = today.getDay();

    const workday = ['2024-05-11', '2024-09-14', '2024-09-29', '2024-10-12'];
    const holidays = ['2024-05-03', '2024-06-10', '2024-09-16', '2024-09-17', '2024-10-01', '2024-10-02', '2024-10-03', '2024-10-04', '2024-10-07'];
    const todayStr = today.toISOString().slice(0, 10);

    // 调休，返回 false
    if (workday.includes(todayStr)) {
        return false;
    }

    // 周末或节假日，返回 true
    return dayOfWeek === 0 || dayOfWeek === 6 || holidays.includes(todayStr);
}


module.exports = storeService;
