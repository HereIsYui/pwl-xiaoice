var mysql = require('mysql');
const { configInfo: conf } = require('../config');

var pool = mysql.createPool(conf.database);
var query = function (sql, callback = () => {}) {
    pool.getConnection(function (err, conn) {
        if (err) {
            callback(err, null, null);
        } else {
            conn.query(sql, function (qerr, vals, fields) {
                //释放连接
                conn.release();
                //事件驱动回调
                callback(qerr, vals, fields);
            });
        }
    });
};
module.exports = query;
