const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');
const bcrypt = require('bcryptjs');

class Admin extends Model { }

Admin.init({
    admin_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    role: {
        type: DataTypes.ENUM('超级管理员', '店长', '店员'),
        allowNull: false
    },
    store_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'stores', // 指向Store模型，使用表名而非模型名
            key: 'store_id'
        }
    },
    admin_account: {
        type: DataTypes.STRING(255),
        unique: true,
        allowNull: false
    },
    admin_password: {
        type: DataTypes.STRING(255),
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Admin',
    tableName: 'admins',
    timestamps: false,
    hooks: {
        beforeCreate: async (admin) => {
            if (admin.admin_password) {
                const salt = await bcrypt.genSalt(10); // 使用bcryptjs生成盐值
                admin.admin_password = await bcrypt.hash(admin.admin_password, salt); // 使用bcryptjs哈希密码
            }
        },
        beforeUpdate: async (admin) => {
            if (admin.changed('admin_password')) { // 检查密码是否更改
                const salt = await bcrypt.genSalt(10);
                admin.admin_password = await bcrypt.hash(admin.admin_password, salt);
            }
        }
    }
});

module.exports = Admin;