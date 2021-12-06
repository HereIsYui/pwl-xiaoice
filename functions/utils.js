const { configInfo: conf } = require('./config');
const axios = require('axios');

/**
 * 日期、时间格式化
 * @param {Date} time 需要转换的时间
 * @param {string} str 返回的格式，$[YMdhms]作为分割
 * @returns 格式化后的时间差
 */
function cnFmt(time, str) {
    return str
        .replace(/y/i, time.getFullYear() - 1970)
        .replace(/M/i, time.getMonth())
        .replace(/d/i, time.getDate() - 1)
        .replace(/h/i, time.getHours())
        .replace(/m/i, time.getMinutes())
        .replace(/s/i, time.getSeconds())
        .replace(/\$\[0+[^\]]+\]|\$\[|\]/g, '');
}
/**
 * 秒数转时间（字符串）
 * @param {number} time 需要转换的时间，单位：秒
 * @returns 中文形式剩余时间
 */
function formatTime(time) {
    return cnFmt(
        new Date(time * 1000 - 28800000),
        '$[Y年]$[M月]$[D天]$[h小时]$[m分钟]$[S秒]'
    );
}
/**
 * 链接套上CDN加速
 * @param {url} url 需要转换的链接
 * @param {Boolean} isForce 是否强制CDN，即如果超过限制就使用第三方接口
 * @returns CDN后的链接,如果CDN处理错误，返回原链接，@param isForce 为真时返回第三方接口
 * 
 * (其实就是故意限制时长)
 */
async function getCDNLinks(url, isForce = false) {
    try {
const axios = require('axios');
        const resp = await axios({
            method: 'post',
            url: 'https://proxy.taozhiyu.workers.dev/request/',
            data: JSON.stringify({
                method: 'GET',
                url,
                token: conf.api.token,
                max_age: conf.api.max_age, //默认14400，有效期4小时
            }),
        });
        if (resp.status === 200) {
            return `https://proxy.taozhiyu.workers.dev/request/${resp.data.key}`;
        }
        console.log('CDN状态错误');
        return isForce ? `https://proxy.onesrc.workers.dev/?url=${url}` : url;
    } catch (e) {
        console.log('CDN获取失败');
        return isForce ? `https://proxy.onesrc.workers.dev/?url=${url}` : url;
    }
}
module.exports = { formatTime, getCDNLinks };
