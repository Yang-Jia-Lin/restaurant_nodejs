const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

class Invitation extends Model {}

Invitation.init({
    invitation_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    inviter: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'User',
            key: 'user_id'
        }
    },
    invitee: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'User',
            key: 'user_id'
        }
    },
    invitation_status: {
        type: DataTypes.ENUM('invited','registered', 'ordered'),
        defaultValue: 'invited'
    },
    reward_status: {
        type: DataTypes.ENUM('unrewarded', 'rewarded'),
        defaultValue: 'unrewarded'
    }
}, {
    sequelize,
    modelName: 'Invitation',
    tableName: 'invitations',
    timestamps: false
});

module.exports = Invitation;