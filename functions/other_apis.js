const axios = require('axios');
const query = require('./database/mysql');
const {
    configInfo: conf
} = require('./config');
const {
    xiaoBingEncode
} = require('./utils');
const e = require('express');

/**
 * 网易云点歌
 * @param {string} user 用户名
 * @param {string} message 发言消息
 * @returns 查询是否成功
 */
async function wyydiange(user, message) {
    let msg = message.substr(message.indexOf('点歌') + 2).trim();
    msg = encodeURI(msg);
    try {
        const res = await axios({
            method: 'POST',
            headers: {
                Host: 'music.163.com',
                Origin: 'http://music.163.com',
                'user-agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded',
                referer: 'http://music.163.com/search/',
            },
            url: `http://music.163.com/api/search/get/web?csrf_token&hlpretag&hlposttag&s=${msg}&type=1&offset=0&total=true&limit=1`,
        });
        let mid = res.data.result.songs[0].id;
        let cb = `>滴~ 你点的歌来了 \n\n<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="//music.163.com/outchain/player?type=2&id=${mid}&auto=0&height=66"></iframe>`
        return cb;
    } catch (error) {
        console.log(error);
        return "你丫的这首歌太难找了!换一个!";
    }
}

/**
 * 获取天气
 * @param {string} user 用户名
 * @param {string} msg 消息
 */
function getXiaohuaAndTianqi(user, msg) {
    return new Promise((resolve, reject) => {
        let dateReg = /(今天|明天|后天|大后天)*天气/
        let date = msg.match(dateReg)[1];
        let adr = "";
        if (date) {
            adr = msg.substr(0, msg.indexOf(date))
        } else {
            adr = msg.substr(0, msg.indexOf("天气"))
        }
        if (!adr) {
            resolve("你查询了一个寂寞~ \n 天气指令：小冰 地点[时间]天气");
        }
        console.log(JSON.stringify({
            addr: adr.split("").join("%"),
            date: date
        }))
        query(
            `SELECT * FROM adcode WHERE addr LIKE '%${adr.split("").join("%")}%'`,
            async function (err, vals) {
                if (err) {
                    console.log('checkSetuTime出错:', err);
                } else {
                    if (vals.length == 0) {
                        resolve(`未查询到地点：${adr}`)
                    } else {
                        const res = await axios({
                            method: 'get',
                            url: `https://api.caiyunapp.com/v2.5/${conf.weather.key}/${vals[0].long},${vals[0].lat}/weather.json?alert=true`,
                        });
                        if (res.data.status == "ok") {
                            try {
                                let weatherData = res.data.result;
                                let weather = weatherData.daily.temperature;
                                let weatherCode = weatherData.daily.skycon;
                                let alertInfo = weatherData.alert.content;
                                let levelCode = {
                                    "01": "台风",
                                    "02": "暴雨",
                                    "03": "暴雪",
                                    "04": "寒潮",
                                    "05": "大风",
                                    "06": "沙尘暴",
                                    "07": "高温",
                                    "08": "干旱",
                                    "09": "雷电",
                                    "10": "冰雹",
                                    "11": "霜冻",
                                    "12": "大雾",
                                    "13": "霾",
                                    "14": "道路结冰",
                                    "15": "森林火灾",
                                    "16": "雷雨大风",

                                }
                                let warningCode = {
                                    "01": {
                                        name: "蓝色",
                                        color: "blue"
                                    },
                                    "02": {
                                        name: "黄色",
                                        color: "yellow"
                                    },
                                    "03": {
                                        name: "橙色",
                                        color: "orange"
                                    },
                                    "04": {
                                        name: "红色",
                                        color: "red"
                                    },
                                }
                                let cb = `\n ${adr}:${weatherData.forecast_keypoint}`;
                                let msg = "";
                                if (alertInfo.length > 0) {
                                    alertInfo.forEach(items => {
                                        let code = items.code.split("");
                                        items.code1 = code[0] + code[1];
                                        items.code2 = code[2] + code[3];
                                        msg += `<img src="https://img.shields.io/badge/-${levelCode[items.code1]}-${warningCode[items.code2].color}">`
                                    })
                                    msg += " \n "
                                }
                                if (date == "今天") {
                                    let ndate = new Date(weather[0].date);
                                    let m = ndate.getMonth() + 1;
                                    let d = ndate.getDate();
                                    let url = `https://www.lingmx.com/card/index.html?m=${m}&d=${d}&w=${weatherCode[0].value}&a=${Math.ceil(weather[0].avg)}`
                                    msg += `<iframe src="${url}" width="250" height="320" frameborder="0"></iframe> \n`
                                } else if (date == "明天") {
                                    let ndate = new Date(weather[1].date);
                                    let m = ndate.getMonth() + 1;
                                    let d = ndate.getDate();
                                    let url = `https://www.lingmx.com/card/index.html?m=${m}&d=${d}&w=${weatherCode[1].value}&a=${Math.ceil(weather[1].avg)}`
                                    msg += `<iframe src="${url}" width="250" height="320" frameborder="0"></iframe> \n`
                                } else if (date == "后天") {
                                    let ndate = new Date(weather[2].date);
                                    let m = ndate.getMonth() + 1;
                                    let d = ndate.getDate();
                                    let url = `https://www.lingmx.com/card/index.html?m=${m}&d=${d}&w=${weatherCode[2].value}&a=${Math.ceil(weather[2].avg)}`
                                    msg += `<iframe src="${url}" width="250" height="320" frameborder="0"></iframe> \n`
                                } else if (date == "大后天") {
                                    let ndate = new Date(weather[3].date);
                                    let m = ndate.getMonth() + 1;
                                    let d = ndate.getDate();
                                    let url = `https://www.lingmx.com/card/index.html?m=${m}&d=${d}&w=${weatherCode[3].value}&a=${Math.ceil(weather[3].avg)}`
                                    msg += `<iframe src="${url}" width="250" height="320" frameborder="0"></iframe> \n`
                                } else {
                                    let date = [];
                                    let weatherCodeList = [];
                                    let max = [];
                                    let min = [];
                                    for (let i = 0; i < 5; i++) {

                                        let ndate = new Date(weather[i].date);
                                        let m = ndate.getMonth() + 1;
                                        let d = ndate.getDate();
                                        date.push(`${m}/${d}`);
                                        weatherCodeList.push(weatherCode[i].value);
                                        max.push(weather[i].max)
                                        min.push(weather[i].min)
                                    }
                                    let url = `https://www.lingmx.com/card/index2.html?date=${date.join(",")}&weatherCode=${weatherCodeList.join(",")}&max=${max.join(",")}&min=${min.join(",")}&t=${adr}&st=${weatherData.forecast_keypoint}`
                                    msg += `<iframe src="${url}" width="380" height="370" frameborder="0"></iframe> \n`;
                                }
                                resolve(msg)
                            } catch (e) {
                                console.log("查询天气异常：" + JSON.stringify(e))
                                resolve("小冰的天气接口出错了哦~")
                            }
                        } else {
                            resolve("小冰的天气接口出错了哦~")
                        }
                    }
                }
            }
        );
    })
}

/**
 * 从微软的接口与小冰聊天
 * @param {string} msg 消息
 */
async function chatWithXiaoBingByBing(msg) {
    try {
        const res = await axios({
            method: 'post',
            url: 'https://cn.bing.com/english/zochatv2?cc=cn&ensearch=0',
            data: `{"query":{"NormalizedQuery":"${xiaoBingEncode(
                msg
            )}"},"from":"chatbox"}`,
        });
        let cb = '';
        // console.log(res.data);
        cb = res.data.content;
        return cb;
    } catch (error) {
        console.log('不知道什么问题', error);
        return '新小冰的接口似乎出问题了？不是很懂=_=';
    }
}


/**
 * 获取活动排名
 */
let RankingResult = {};
async function getActivutyRanking(tag) {
    if (JSON.stringify(RankingResult) === '{}' || new Date().getTime() - RankingResult.time.getTime() > 1000 * 60 * 60 * 2) {
        let result = await GetActivityInfo(tag);
        return result
    } else {
        let result = RankingResult.result;
        result += `数据更新时间：${RankingResult.time.toLocaleString()}`
        return result
    }
}

async function GetActivityInfo(tag) {
    const res = await axios({
        method: 'get',
        url: `https://fishpi.cn/api/articles/tag/${encodeURI(tag)}/hot/?apiKey=${conf.PWL.apiKey}`,
    })
    if (res.data.code == 0) {
        let rList = res.data.data.articles;
        for (let item of rList) {
            if (item.articleAuthorName == 'csfwff') break;
            item._activityScore = item.articleGoodCnt + item.articleCollectCnt + (item.articleThankCnt * 3);
            item.commUidList = []
            if (item.articleCommentCount > 0) {
                item.commUidList = [item.articleAuthorId];
                const thisArticleDetail = await axios({
                    url: `https://fishpi.cn/api/article/${item.oId}?apiKey=${conf.PWL.apiKey}`
                })
                if (thisArticleDetail.data.code == 0) {
                    let commList = thisArticleDetail.data.data.article.articleComments;
                    commList.forEach(comm => {
                        if (!item.commUidList.includes(comm.commentAuthorId)) {
                            item.commUidList.push(comm.commentAuthorId)
                            item._activityScore += 2;
                        }
                    })
                }
            }
        }
        rList.sort(function (a, b) {
            return b._activityScore - a._activityScore
        })
        let result = `<details><summary>[${tag}]活动排行榜：</summary><table><tr><th>排名</th><th>作者</th><th>总分</th><th>点赞</th><th>收藏</th><th>评论</th><th>感谢</th></tr>`;
        for (let i = 0; i < 10; i++) {
            result += `<tr><td>${i+1}</td><td><a href="https://fishpi.cn${rList[i].articlePermalink}">${rList[i].articleAuthorName}</a></td><td>${rList[i]._activityScore}</td><td>${rList[i].articleGoodCnt}</td><td>${rList[i].articleCollectCnt}</td><td>${rList[i].commUidList.length}</td><td>${rList[i].articleThankCnt}</td></tr>`
        }
        result += `</table></details>`
        RankingResult.result = result;
        RankingResult.time = new Date();
        return result
    } else {
        return `报错啦`
    }
}
GetActivityInfo()
setInterval(() => {
    if (new Date().getHours() > 9 && new Date().getHours() < 22) {
        GetActivityInfo()
    }
}, 1000 * 60 * 90)


module.exports = {
    wyydiange,
    getXiaohuaAndTianqi,
    chatWithXiaoBingByBing,
    getActivutyRanking
};