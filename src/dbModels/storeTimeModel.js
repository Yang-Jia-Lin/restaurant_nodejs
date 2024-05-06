const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

class StoreTimeSlot extends Model {}

StoreTimeSlot.init({
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
    time_slot: {
        type: DataTypes.TIME,
        allowNull: false
    },
    time_status: {
        type: DataTypes.ENUM('available', 'busy'),
        allowNull: false,
        defaultValue: 'available'
    },
    daily: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: 'StoreTimeSlot',
    tableName: 'store_time_slots',
    timestamps: false
});

module.exports = StoreTimeSlot;
