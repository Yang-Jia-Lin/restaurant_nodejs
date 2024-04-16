const User = require('../dbModels/usersModel');

const userService = {

    // 1.创建用户
    createUser: async (userData) => {
        try {
            return await User.create(userData);
        } catch (error) {
            throw error;
        }
    },


    // 2.获取用户信息
    getUserById: async (userId) => {
        try {
            const user = await User.findByPk(userId);
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error) {
            throw error;
        }
    },
    getUserByOpenId: async (openid) => {
        try {
            return await User.findOne({
                where: { openid: openid }
            });
        } catch (error) {
            throw error;
        }
    },


    // 3.更新用户信息
    updateUser: async (userId, updateData) => {
        try {
            const [updated] = await User.update(updateData, {
                where: { user_id: userId }
            });
            if (!updated) {
                throw new Error('User not found');
            }
            return await User.findByPk(userId);
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    },
    addUserPoints: async (userId, pointsToAdd) => {
        try {
            const user = await User.findByPk(userId);
            if (!user) {
                throw new Error('User not found');
            }
            const newPoints = (Number(user.points) || 0) + Number(pointsToAdd);
            const [updated] = await User.update({ points: newPoints }, {
                where: { user_id: userId }
            });
            if (!updated) {
                throw new Error('Update failed');
            }
            return await User.findByPk(userId);
        } catch (error) {
            throw error;
        }
    },


    // 4.删除用户
    deleteUser: async (userId) => {
        try {
            const deleted = await User.destroy({
                where: { user_id: userId }
            });
            if (!deleted) {
                throw new Error('User not found');
            }
        } catch (error) {
            throw error;
        }
    }
};

module.exports = userService;
