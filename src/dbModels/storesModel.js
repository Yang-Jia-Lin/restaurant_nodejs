const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig'); // 确保这个路径指向您的数据库配置文件

class Store extends Model { }

Store.init({
    store_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    store_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    address: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    phone: { // 这里的字段名已从contact_number更新为phone
        type: DataTypes.STRING(20),
        unique: true
    },
    business_hours: {
        type: DataTypes.STRING(255),
    },
    store_image: {
        type: DataTypes.STRING(255),
    },
    business_status: {
        type: DataTypes.ENUM('营业中', '休息中'), // 更新枚举值以匹配数据库
        allowNull: false
    },
    takeout_status: {
        type: DataTypes.ENUM('可配送', '暂不配送'),
        allowNull: false
    },
    announcement: {
        type: DataTypes.TEXT,
    },
    // 添加经纬度字段
    longitude: {
        type: DataTypes.FLOAT(10, 6),
    },
    latitude: {
        type: DataTypes.FLOAT(10, 6),
    },
    // 增加不外送时间段
    takeout_stop_begin1: {
        type: DataTypes.TIME,
    },
    takeout_stop_end1: {
        type: DataTypes.TIME,
    },
    takeout_stop_begin2: {
        type: DataTypes.TIME,
    },
    takeout_stop_end2: {
        type: DataTypes.TIME,
    }
}, {
    sequelize,
    modelName: 'Store',
    tableName: 'stores',
    timestamps: true, // 确认启用Sequelize管理createdAt和updatedAt字段
});

module.exports = Store;
