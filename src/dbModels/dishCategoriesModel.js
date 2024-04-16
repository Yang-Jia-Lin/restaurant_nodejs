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
        unique: true
    },
    category_icon: DataTypes.STRING(255)
}, {
    sequelize,
    modelName: 'DishCategory',
    tableName: 'dish_categories',
    timestamps: false // 不启用自动时间戳
});

module.exports = DishCategory;