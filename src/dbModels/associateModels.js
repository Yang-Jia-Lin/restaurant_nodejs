const Dish = require('./dishesModel');
const DishCategory = require('./dishCategoriesModel');
const StoreDishStatus = require('./storeDishStatusModel');
const Store = require('./storesModel');
const Pickup = require('./pickupModel');
const Admin = require('./adminsModel');
const Order = require('./ordersModel');
const OrderDetail = require('./orderDetailsModel');

// 1. Dish与DishCategory之间的关系
Dish.belongsTo(DishCategory, {
    foreignKey: 'category_id',
    as: 'category',
});
DishCategory.hasMany(Dish, {
    foreignKey: 'category_id',
    as: 'dishes',
});


// 2. StoreDishStatus与Dish之间的关系
StoreDishStatus.belongsTo(Dish, {
    foreignKey: 'dish_id',
    as: 'dish',
});
Dish.hasMany(StoreDishStatus, {
    foreignKey: 'dish_id',
    as: 'storeStatuses',
});


// 3. Admin与Store之间的关系
Admin.belongsTo(Store, {
    foreignKey: 'store_id',
    as: 'store'
});
Store.hasMany(Admin, {
    foreignKey: 'store_id',
    as: 'admins'
});


// 4. OrderDetail与Dish之间的关系
OrderDetail.belongsTo(Dish, {
    foreignKey: 'dish_id',
    as: 'dish' // 可选的别名，使得关联更具语义化
});
Dish.hasMany(OrderDetail, {
    foreignKey: 'dish_id',
    as: 'orderDetails' // 可选的别名
});


// 5. OrderDetail与Order之间的关系
Order.hasMany(OrderDetail, {
    foreignKey: 'order_id', // OrderDetail 表中关联 Order 表的外键
    as: 'orderDetails' // 可选的别名，使得关联更具语义化
});
OrderDetail.belongsTo(Order, {
    foreignKey: 'order_id', // OrderDetail 表中关联 Order 表的外键
    as: 'order' // 可选的别名
});


// 6. Pick与Store之间的关系
Store.hasMany(Pickup, {
    foreignKey: 'store_id',
    as: 'pickup'
});
Pickup.belongsTo(Store, {
    foreignKey: 'store_id',
    as: 'store'
});