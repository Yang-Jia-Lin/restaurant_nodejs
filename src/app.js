const express = require('express');
const sequelize = require('./config/dbConfig');
require('./dbModels/associateModels'); // 加载模型关联定义
require('./controllers/queueHandlers');// 加载队列

const usersController = require('./controllers/usersController');
const storesController = require('./controllers/storesController');
const dishesController = require('./controllers/dishesController');
const adminsController = require('./controllers/adminsController');
const carouselsController = require('./controllers/carouselImagesController');
const ordersController = require('./controllers/ordersController');
const payController = require('./controllers/payController');
const OrdersService = require('./services/ordersService');
const addressController = require('./controllers/addressController');
const printerController = require('./controllers/printerController');
const setPrinter = require('./controllers/setPrint');

const cors = require('cors');
const allowedOrigins = ['*'];

const app = express();
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};
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


// 定义定时任务启动函数
function startOrderProcessingScheduler() {
  const interval = 1 * 60 * 1000; // 每1分钟执行一次
  setInterval(() => {
    	OrdersService.scanAndProcessOrders();
  }, interval);
  console.log('Order processing scheduler started.');
}

//function startDailyOrderDeletionScheduler() {
//  const interval = 12 * 60 * 60 * 1000;
//  setInterval(() => {
//      OrdersService.scanAndDeletePendingOrders();
//  }, interval);
//  console.log('Daily order deletion scheduler started.');
//}


// 启动Express服务器
sequelize.sync().then(() => {
  app.listen(3000, () => {
    console.log('Server is running on port 3000. Database connected.');
    // 启动定时任务
    startOrderProcessingScheduler(); 
    //startDailyOrderDeletionScheduler();
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
    //process.exit(1); // 强烈推荐在处理完未捕获异常后重启应用
});