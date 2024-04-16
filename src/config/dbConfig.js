// 导入数据库配置信息
require('dotenv').config();
const database = process.env.DB_NAME;
const username = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const host = process.env.DB_HOST;
const dialect = 'mysql';

// 创建 Sequelize 实例
const Sequelize = require('sequelize');
const sequelize = new Sequelize(database, username, password, {
    host: host,
    dialect: dialect,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    define: {
        freezeTableName: true
    },
    timezone: '+08:00'
});

// 测试数据库连接
sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

// 导出同一个 Sequelize 实例（连接同一个数据库）
module.exports = sequelize;