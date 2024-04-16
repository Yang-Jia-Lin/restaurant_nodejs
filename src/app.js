require('./dbModels/associateModels'); // 加载模型关联定义
require('./controllers/queueHandlers');// 加载队列
const express = require('express'); // 加载Express模块
const app = express(); // 创建Express应用实例，与下面的Router实例（require）关联

// 加载：应用的路由模块
const sequelize = require('./config/dbConfig');
const usersController = require('./controllers/usersController');
const storesController = require('./controllers/storesController');
const dishesController = require('./controllers/dishesController');
const adminsController = require('./controllers/adminsController');
const carouselsController = require('./controllers/carouselImagesController');
const ordersController = require('./controllers/ordersController');
const payController = require('./controllers/payController');
const addressController = require('./controllers/addressController');
const printerController = require('./controllers/printerController');
const setPrinter = require('./controllers/setPrint');
const OrdersService = require('./services/ordersService');

// 加载：应用的跨域模块
const cors = require('cors');
const allowedOrigins = ['*'];
const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
};

// 设置：应用的跨域和路由
app.use(cors(corsOptions));
app.use(express.json());
app.use('/restaurant/users', usersController);
app.use('/restaurant/stores', storesController);
app.use('/restaurant/dishes', dishesController);
app.use('/restaurant/admins', adminsController);
app.use('/restaurant/carousels', carouselsController);
app.use('/restaurant/orders', ordersController);
app.use('/restaurant/pay', payController);
app.use('/restaurant/address', addressController);
app.use('/restaurant/printer', printerController);
app.use('/restaurant/setPrinter', setPrinter);


// 路由模块加载完成后，启动Express服务器，监听端口3000，并连接数据库
sequelize.sync().then(() => {
    app.listen(3000, () => {
        // 启动定时任务
        setInterval(async () => {
            try {
                await OrdersService.scanAndProcessOrders();
            } catch (error) {
                console.error('Error processing orders:', error);
            }
        }, 60 * 1000);
        console.log('Server is running on port 3000. Database connected.');
        console.log('Order processing scheduler started.');
    });
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});


// 全局未捕获异常和Promise拒绝处理
process.on('unhandledRejection', (reason, promise) => {
    console.error('未处理的拒绝：', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('未捕获的异常：', error);
    // process.exit(1);
});