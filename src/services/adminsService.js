const bcrypt = require('bcryptjs');
const Admin = require('../dbModels/adminsModel');
const Store = require('../dbModels/storesModel');

const adminsService = {
    // 注册管理员
    registerAdmin: async ({ admin_account, admin_password, store_id, role }) => {
        try {
            // 检查账号是否已存在
            const existingAdmin = await Admin.findOne({ where: { admin_account } });
            if (existingAdmin) {
                throw new Error('Admin account already exists'); // 主动触发
            }

            // 创建管理员
            return await Admin.create({
                admin_account,
                admin_password, // 密码在模型层通过钩子自动加密
                store_id,
                role
            });
        } catch (error) {
            throw error;
        }
    },

    // 管理员登录
    loginAdmin: async ({ admin_account, admin_password }) => {
        try {
            const admin = await Admin.findOne({
                where: { admin_account },
                include: [{
                    model: Store,
                    as: 'store',
                }]
            });

            // 检查管理员是否存在
            if (!admin) {
                throw new Error('Admin not found');
            }

            // 校验密码
            const isMatch = await bcrypt.compare(admin_password, admin.admin_password);
            if (!isMatch) {
                throw new Error('Invalid credentials');
            }

            // 返回登录成功的管理员信息，包括门店信息
            return {
                admin_id: admin.admin_id,
                admin_account: admin.admin_account,
                store_id: admin.store_id,
                role: admin.role,
                store: admin.store // 包括关联的门店信息
            };
        } catch (error) {
            throw error;
        }
    }

};

module.exports = adminsService;
