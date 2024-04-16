const { Model, DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid'); // 引入 uuid 模块
const sequelize = require('../config/dbConfig');

// 生成没有破折号的 UUID
const generateUUIDWithoutDashes = () => {
    return uuidv4().replace(/-/g, '');
};

class Order extends Model { }

Order.init({
    order_id: {
        type: DataTypes.STRING(32),
        defaultValue: generateUUIDWithoutDashes,
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
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'User',
            key: 'user_id'
        }
    },
    openid: {
    	   type: DataTypes.STRING(255),
    	   allowNull: false
    },
    pickup_number: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    order_type: {
        type: DataTypes.ENUM('到店', '外卖'),
        allowNull: false
    },
    order_time: {
        type: DataTypes.DATE,
        allowNull: false
    },
    order_status: {
        type: DataTypes.ENUM('待支付', '等待中', '制作中', '配送中', '退款中', '已完成', '已取消', '已退款'),
        allowNull: false
    },
    delivery_type: {
        type: DataTypes.ENUM('立即', '预约'),
        allowNull: false
    },
    delivery_time: DataTypes.DATE,
    total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    payment_method: {
        type: DataTypes.ENUM('微信支付', '余额支付'),
        allowNull: false
    },
    description: {
    	   type: DataTypes.STRING(255),
	   defaultValue: '唐合丰面馆订单'
    },
    pickup_id: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    note: DataTypes.TEXT,
    address: DataTypes.TEXT,
    call_name: DataTypes.STRING(255),
    phone: DataTypes.STRING(20)
}, {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: false
});

module.exports = Order;