const sequelize = require('../config/dbConfig');
const Pickup = require('../dbModels/pickupModel'); // 引入 Pickup 模型

class PickupService {

    // 获取新的取餐号并更新
    static async incrementPickupNumber(storeId) {
        const t = await sequelize.transaction(); // 开始一个新的事务
        try {
            const result = await sequelize.transaction(async (transaction) => {
                const pickup = await Pickup.findOne({ where: { store_id: storeId } }, { transaction });

                // 保存当前取餐号以返回
                const currentPickupNumber = pickup.pickup_number;
                const currentPickupId = pickup.pickup_id;

                // 检查取餐号是否到达100，如果是，则重置为1，否则增加1
                pickup.pickup_number = pickup.pickup_number + 1;
            	  pickup.pickup_id = pickup.pickup_id + 1;
	            if (currentPickupNumber == 99) {
	                pickup.pickup_number = 1;
	            }

                // 保存更改
                await pickup.save({ transaction });

                // 返回增加前的取餐号
                return { updatedPickup: pickup, previousPickupNumber: currentPickupNumber, previousPickupId: currentPickupId };
            });

            // 提交事务
            await t.commit();
            return result;
        } catch (error) {
            // 发生错误时回滚
            await t.rollback();
            throw error;
        }
    }

}

module.exports = PickupService;