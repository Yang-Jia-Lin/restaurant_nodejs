const sequelize = require('../config/dbConfig');
const Pickup = require('../dbModels/pickupModel');

const PickupService = {
    // 获取取餐号并更新
    incrementPickupNumber: async (storeId) => {
        const transaction = await sequelize.transaction(); // 开始一个新的事务
        try {
            const pickup = await Pickup.findOne({ where: { store_id: storeId }, transaction });

            // 1.保存当前取餐号用于返回
            const currentPickupNumber = pickup.pickup_number;
            const currentPickupId = pickup.pickup_id;
            // 2.修改取餐号（增加1或重置为1）
            pickup.pickup_number = pickup.pickup_number + 1;
            pickup.pickup_id = pickup.pickup_id + 1;
            if (currentPickupNumber === 99) {
                pickup.pickup_number = 1;
            }
            // 3.保存更改到数据库并提交事务
            await pickup.save({ transaction });
            await transaction.commit();

            return { updatedPickup: pickup, previousPickupNumber: currentPickupNumber, previousPickupId: currentPickupId };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
};

module.exports = PickupService;