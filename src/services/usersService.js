const User = require('../dbModels/usersModel');

// 1. 保存用户相关信息(增)
async function createUser(userData) {
    try {
        const newUser = await User.create(userData);
        return newUser;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

// 2. 获取用户信息(查)
async function getUserById(userId) {
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    } catch (error) {
        console.error('Error finding user:', error);
        throw error;
    }
}

async function getUserByOpenId(openid) {
    try {
        const user = await User.findOne({
            where: { openid: openid }
        });
        return user;
    } catch (error) {
        console.error('Error finding user by openid:', error);
        throw error;
    }
}


// 3. 修改用户相关信息(改)
async function updateUser(userId, updateData) {
    try {
        const [updated] = await User.update(updateData, {
            where: { user_id: userId }
        });
        if (updated) {
            const updatedUser = await User.findByPk(userId);
            return updatedUser;
        }
        throw new Error('User not found');
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}

// 4. 删除用户信息(删)
async function deleteUser(userId) {
    try {
        const deleted = await User.destroy({
            where: { user_id: userId }
        });
        if (deleted) {
            return { message: 'User deleted successfully' };
        }
        throw new Error('User not found');
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
}

module.exports = {
    createUser,
    getUserById,
    getUserByOpenId,
    updateUser,
    deleteUser
};