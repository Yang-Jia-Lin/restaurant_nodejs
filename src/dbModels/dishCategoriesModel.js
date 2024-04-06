const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig'); // 请确保这个路径指向您的数据库配置文件

class DishCategory extends Model { }

DishCategory.init({
    category_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    category_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true // 确保分类名称是唯一的
    },
    category_icon: {
        type: DataTypes.STRING(255) // 可以为空，存储分类图标路径
    }
}, {
    sequelize,
    modelName: 'DishCategory',
    tableName: 'dish_categories',
    timestamps: false // 不需要自动时间戳
});

module.exports = DishCategory;