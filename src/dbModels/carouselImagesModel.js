const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

class CarouselImage extends Model { }

CarouselImage.init({
    image_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    sequence: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false
    },
    description: DataTypes.TEXT,
    url: {
        type: DataTypes.STRING(255),
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'CarouselImage',
    tableName: 'carousel_images',
    timestamps: false
});

module.exports = CarouselImage;