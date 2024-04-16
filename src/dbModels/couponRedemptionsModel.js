const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

class CouponRedemption extends Model { }

CouponRedemption.init({
    redemption_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    type: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    redemption_code: {
        type: DataTypes.STRING(255),
        unique: true,
        allowNull: false
    },
    redemption_status: {
        type: DataTypes.ENUM('已兑换', '未兑换'),
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'CouponRedemption',
    tableName: 'coupon_redemptions',
    timestamps: true
});
