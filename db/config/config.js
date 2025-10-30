require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'ROOT',
    database: process.env.MYSQL_DATABASE || 'SHUKKETSU_BUGYO',
    host: 'localhost',
    port: 3306,
    dialect: 'mysql'
  },
  docker: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'ROOT',
    database: process.env.MYSQL_DATABASE || 'SHUKKETSU_BUGYO',
    host: 'localhost',
    port: 3306,
    dialect: 'mysql'
  }
};