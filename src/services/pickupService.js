const sequelize = require('../config/dbConfig');
const Pickup = require('../dbModels/pickupModel');

const PickupService = {
    // 获取取餐号并更新
    incrementPickupNumber: async (storeId) => {
        // 开始一个新的事务
        const transaction = await sequelize.transaction();
        try {
            // 通过FOR UPDATE锁定找到的行
            const pickup = await Pickup.findOne({
                where: { store_id: storeId },
                transaction,
                lock: transaction.LOCK.UPDATE // 添加行锁
            });

            if (!pickup) {
                throw new Error('未找到对应的取餐记录');
            }

            // 保存当前取餐号用于返回
            const currentPickupNumber = pickup.pickup_number;
            const currentPickupId = pickup.pickup_id;

            // 修改取餐号（增加1或重置为1）
            pickup.pickup_number = pickup.pickup_number + 1;
            pickup.pickup_id = pickup.pickup_id + 1;

            // 如果达到最大值，则重置
            if (currentPickupNumber === 99) {
                pickup.pickup_number = 1;
            }

            // 保存更改到数据库并提交事务
            await pickup.save({ transaction });
            await transaction.commit();

            return { updatedPickup: pickup, previousPickupNumber: currentPickupNumber, previousPickupId: currentPickupId };
        } catch (error) {
            // 发生错误，回滚事务
            await transaction.rollback();
            throw error;
        }
    }
};

module.exports = PickupService;
