const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig'); // 引入Sequelize实例

class OrderDetail extends Model { }

OrderDetail.init({
    detail_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    order_id: {
        type: DataTypes.STRING(32),
        allowNull: false,
        references: {
            model: 'orders',
            key: 'order_id'
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
    dish_name: DataTypes.STRING(255),
    eat_type: {
        type: DataTypes.ENUM('堂食', '打包'),
        defaultValue: '堂食'
    },
    mandatory_options: DataTypes.JSON,
    optional_options: DataTypes.JSON,
    mandatory_values: DataTypes.JSON,
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    note: DataTypes.TEXT,
}, {
    sequelize,
    modelName: 'OrderDetail',
    tableName: 'order_details',
    timestamps: false
});

module.exports = OrderDetail;