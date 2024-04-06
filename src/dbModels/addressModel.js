const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig'); // 引入Sequelize实例

class Address extends Model { }

Address.init({
    address_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    address_value: {
        type: DataTypes.STRING(255),
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Address',
    tableName: 'address',
    timestamps: false
});

module.exports = Address;