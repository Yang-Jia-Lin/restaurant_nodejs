// 环境变量
require('dotenv').config();
const database = process.env.DB_NAME;
const username = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const host = process.env.DB_HOST;
const dialect = 'mysql';

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
    timezone: '+08:00'  // 这通常放在这里
});

sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

module.exports = sequelize;