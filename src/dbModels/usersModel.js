const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig'); // 引入Sequelize实例

class User extends Model { }

User.init({
    user_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true, // 设置自增，自动生成主键
        primaryKey: true
    },
    openid: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    nickname: {
        type: DataTypes.STRING(255), // 昵称，可为空
    },
    avatar_url: {
        type: DataTypes.STRING(255), // 头像URL，可为空
        defaultValue: "https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0",
    },
    phone_number: {
        type: DataTypes.STRING(20),
        unique: true, // 电话号码唯一
    },
    points: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0, // 积分，默认为0
    },
    balance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0, // 余额，默认为0
    },
}, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true, // 启用Sequelize的时间戳功能，自动处理createdAt和updatedAt字段
});

module.exports = User;