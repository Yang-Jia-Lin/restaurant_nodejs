const {Model, DataTypes} = require('sequelize');
const sequelize = require('../config/dbConfig');

class Dish extends Model {}

Dish.init({
    dish_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    dish_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'dish_categories',
            key: 'category_id'
        }
    },
    sales: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    icon: DataTypes.STRING(255), // 存储菜品图标的路径或URL
    keywords: DataTypes.TEXT, // 菜品关键字
    flavor_description: DataTypes.TEXT, // 菜品口味描述
    mandatory_options: DataTypes.JSON,// 菜品必选项
    optional_options: DataTypes.JSON // 菜品多选项
}, {
    sequelize,
    modelName: 'Dish',
    tableName: 'dishes',
    timestamps: false // 不需要自动时间戳
});

module.exports = Dish;