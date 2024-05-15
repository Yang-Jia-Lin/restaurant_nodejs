const PointDetails = require('../dbModels/pointDetailsModel');
const User = require('../dbModels/usersModel');
const sequelize = require('../config/dbConfig');

const pointDetailsService = {

    // 1.修改积点
    addUserPoints: async (userId, pointsToAdd, issueType = '其他') => {
        const transaction = await sequelize.transaction();  // 开启事务
        try {
            // 查找用户并锁定
            const user = await User.findByPk(userId, { lock: true, transaction });
            if (!user) {
                throw new Error('User not found');
            }

            // 更新用户的积点总数
            user.points = (Number(user.points) || 0) + pointsToAdd;
            await user.save({ transaction });

            // 创建积点明细记录
            const pointDetail = await PointDetails.create({
                user_id: userId,
                amount: pointsToAdd,
                issued_at: new Date(),  // 设置当前时间为发放时间
                issue_type: issueType
            }, { transaction });

            await transaction.commit();  // 提交事务

            return {
                updatedUser: user,
                pointDetail
            };
        } catch (error) {
            await transaction.rollback();  // 回滚事务
            throw error;
        }
    },

    // 2.查询用户所有积点记录
    getPointsByUserId: async (userId) => {
        try {
            return await PointDetails.findAll({
                where: { user_id: userId },
                order: [['issued_at', 'DESC']]
            });
        } catch (error) {
            throw error;
        }
    }
};

module.exports = pointDetailsService;