const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

class StoreDishStatus extends Model { }

StoreDishStatus.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    store_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'stores',
            key: 'store_id'
        }
    },
    dish_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'dishes',
            key: 'dish_id'
        }
    },
    serviceType: {
        type: DataTypes.ENUM('到店', '外卖'),
        allowNull: false
    },
    dish_status: {
        type: DataTypes.ENUM('上架', '下架'),
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'StoreDishStatus',
    tableName: 'store_dish_status',
    timestamps: true
});

module.exports = StoreDishStatus;
