const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig'); // 引入Sequelize实例

class Pickup extends Model { }

Pickup.init({
    pick_id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    store_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Store',
            key: 'store_id'
        }
    },
    pickup_number: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    pickup_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Pickup',
    tableName: 'pickup_numbers',
    timestamps: false
});

module.exports = Pickup;