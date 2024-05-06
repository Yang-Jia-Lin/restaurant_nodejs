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
    business_status: {
        type: DataTypes.ENUM('营业中', '休息中'), // 更新枚举值以匹配数据库
        allowNull: false
    },
    takeout_status: {
        type: DataTypes.ENUM('可配送', '暂不配送'),
        allowNull: false
    },
    longitude: {
        type: DataTypes.FLOAT(10, 6),
    },
    latitude: {
        type: DataTypes.FLOAT(10, 6),
    },
    last_updated: {
        type: DataTypes.DATE,
        default: Date.now
    },

    // 后续测试字段
    business_hours: {
        type: DataTypes.STRING(255),
    },
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
    timestamps: false, // 不启用Sequelize管理createdAt和updatedAt字段
});

module.exports = Store;
