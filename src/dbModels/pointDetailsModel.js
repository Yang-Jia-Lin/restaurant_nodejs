const {Model, DataTypes} = require('sequelize');
const sequelize = require('../config/dbConfig');

class PointDetails extends Model {}

PointDetails.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'User',
            key: 'user_id'
        }
    },
    amount: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: false
    },
    issued_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    issue_type: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: '其他'
    }
}, {
    sequelize,
    modelName: 'PointDetails',
    tableName: 'point_details',
    timestamps: false
});

module.exports = PointDetails;