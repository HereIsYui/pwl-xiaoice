const query = require('./database/mysql');
const { sendMsg } = require('./chat');
const { getCDNLinks, formatTime } = require('./utils');
const axios = require('axios');
const { configInfo: conf } = require('./config');
let lastSetuTime = 0;
/**
 * 检测倒计时
 * @param {string} user 用户名
 */
function checkSetuTime(user) {
    query(
        `SELECT * FROM setu_ranking WHERE userName = '${user}'`,
        function(err, vals) {
            if (err) {
                console.log('checkSetuTime出错:', err);
            } else {
                query(
                    vals.length !== 0 ?
                    `UPDATE setu_ranking SET setu_times = setu_times+1 WHERE userName = '${user}'` :
                    `INSERT INTO setu_ranking (userName,setu_times,update_datetime,delete_flag) VALUES('${user}',1,now(),0)`
                );
            }
        }
    );
    const nowTime = new Date();
    if (
        lastSetuTime != 0 &&
        nowTime - lastSetuTime < conf.rob.lspWaitingTime * 60 * 1000
    ) {
        sendMsg(
            `@${user} 你别这么猴急嘛！不是刚给你看过！\n再过【${formatTime(
                (conf.rob.lspWaitingTime * 60 * 1000 -
                    (nowTime - lastSetuTime)) /
                    1000
            )}】，才能看下一张哦！ \n ![lsp](https://pwl.stackoverflow.wiki/2021/12/image-174932da.png)`
        );
        return false;
    }
    lastSetuTime = new Date();
    return true;
}
/**
 * 获取小姐姐图片
 * @param {string} user 用户名
 */
async function getXJJ(user) {
    try {
        if (!checkSetuTime(user)) return;
        const res = await axios({
            method: 'get',
            url: 'http://img.btu.pp.ua/random/api.php?type=json',
            encoding: null,
        });
        const u = /^http/.test(res.data.url) ?
            res.data.url :
            `http://img.btu.pp.ua/random/${res.data.url}`;
        const v = await getCDNLinks(u);
        sendMsg(
                `@${user} :\n > 小姐姐来了，小心旁边窥屏哦! \n ${
                v === u
                    ? '\n![小姐姐](' + v
                    : `图片有效期【${formatTime(
                          conf.api.max_age*60
                      )}】\n\n![小姐姐](${v}`
            })`
        );
        return true;
    } catch (error) {
        sendMsg(`@${user} :\n 不知道出了什么错误，小姐姐来不了! `);
        return false;
    }
}
/**
 * 获取排名
 * @param {string} user 用户名
 */
function GetLSPRanking(user) {
    query(
        `SELECT userName,setu_times FROM setu_ranking ORDER BY setu_times DESC LIMIT 0,10`,
        function (err, vals) {
            if (err) {
                sendMsg(`@${user} :lsp排行榜查询失败！`);
            } else {
                let msg = `> LSP排行榜 \n`;
                vals.forEach((item, index) => {
                    msg += `${index + 1}.  @${item.userName} 共计查询 ${
                        item.setu_times
                    } 次 ${
                        index == 0
                            ? '![lsp之王](https://unv-shield.librian.net/api/unv_shield?scale=0.79&txt=lsp%E4%B9%8B%E7%8E%8B&url=https://www.lingmx.com/52pj/images/die.png&backcolor=568289&fontcolor=ffffff)'
                            : ''
                    }\n`;
                });
                sendMsg(`@${user} :\n ${msg}`);
            }
        }
    );
}
/**
 * 获取涩图消息
 * @param {string} user 用户名
 * @param {string} msg 消息
 */
async function getSetu(user, msg) {
    if (!checkSetuTime(user)) return;
    msg = msg.trim();
    try {
        const res = await axios({
            method: 'get',
            url: encodeURI(
                `https://api.lolicon.app/setu/v2?r18=${
                    conf.rob.is18 ? 1 : 0
                }&size=small${
                    msg.split(' ')[1] ? `&tag=${msg.split(' ')[1]}` : ''
                }`
            ),
            headers: {
                'user-agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36',
            },
        });
        if (res.data.data.length == 0) {
            sendMsg(`@${user} :想啥呢，没有!`);
        } else {
            const sta = await getCDNLinks(res.data.data[0].urls.small, true);
            sendMsg(
                `@${user} :\n > 涩图来了!看不到的请不要看了${
                    res.data.data[0].urls.small === sta
                        ? ''
                        : `<br>链接有效期为【${formatTime(conf.api.max_age*60)}】`
                }<br>![涩图](${sta})`
            );
        }
        return;
    } catch (error) {
        sendMsg(`@${user} :已读，不回!`);
        return;
    }
}
/**
 * 获取小姐姐视频链接
 * @param {gotLink} callback 获取到链接回调，回传参数：获取到的视频url
 */
function getVideoLink(callback) {
    let linkID = [1, 3, 4, 5, 6, 7, 8, 9, 10][Math.floor(Math.random() * 9)];
    axios({
        method: 'get',
        url: `https://mm.diskgirl.com/get/get${linkID}.php`,
    })
        .then(resp => {
            const res = resp.data;
            console.log('获取到链接: ' + res);
            if (/^https?:\/\//.test(res)) {
                axios({
                    method: 'get',
                    url: res,
                })
                    .then(resp => {
                        resp.status === 200
                            ? (console.log('└链接状态正常'),
                              typeof callback === 'function' && callback(res))
                            : getVideoLink(callback);
                    })
                    .catch(() => {
                        getVideoLink(callback);
                    });
            } else getVideoLink(callback);
        })
        .catch(() => {
            console.log('链接获取失败');
            getVideoLink(callback);
        });
}
/**
 * 发送小姐姐视频
 * @param {string} user 用户名
 */
function sendXJJVideo(user) {
    if (!checkSetuTime(user)) return;
    sendMsg(`@${user} :正在获取链接并检测链接活性，请稍等几秒`);
    getVideoLink(async res => {
        const sta = await getCDNLinks(res);
        sendMsg(
            `@${user} :\n > 小姐姐来喽，请在方便的时候查看<br>${
                res === sta
                    ? ''
                    : `视频有效期【${formatTime(conf.api.max_age*60)}】<br>`
            }<br><video controls src='${sta}'/>`
        );
    });
}
/**
 * 获取天气及笑话
 * @param {string} user 用户名
 * @param {string} msg 消息
 */
async function getXiaohuaAndTianqi(user,msg){
    let message = encodeURI(msg)
        const res = await axios({
            method: 'get',
            url:'http://api.qingyunke.com/api.php?key=free&appid=0&msg=' + message
        })
        let cb =  res.data.content;
        cb = cb.replace(/{br}/g,"<br>")
        cb = cb.replace(/菲菲/g,"小冰")
        sendMsg(`@${user} :` + cb);
}
module.exports = { getXJJ, GetLSPRanking, getSetu, sendXJJVideo,getXiaohuaAndTianqi };