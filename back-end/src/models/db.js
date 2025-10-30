require('dotenv').config();
const mysql = require('mysql2/promise');

const db = () => {
    return mysql.createPool({
        host: process.env.DB_HOST,
        port: 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.MYSQL_ROOT_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        connectionLimit: 10,
        namedPlaceholders: false
    });
}

module.exports = db;
