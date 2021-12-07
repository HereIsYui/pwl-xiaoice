const axios = require('axios');
const { configInfo: conf } = require('./config');

let updateCookieInterval = 0;
/**
 * 更新小冰的cookies
 */
function updateCookie(iscancle = false) {
    if (iscancle) {
        clearInterval(updateCookieInterval);
        return;
    }
    updateCookieInterval = setInterval(() => {
        getCookie();
        getChatData('小冰在吗？');
    }, 60 * 60 * 1000); //每1个小时刷新一次
}
/**
 * 网易云点歌
 * @param {string} user 用户名
 * @param {string} message 发言消息
 * @returns 查询是否成功
 */
async function wyydiange(user, message) {
    const { sendMsg } = require('./chat');
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
        sendMsg(
            `@${user} :\n >滴~ 你点的歌来了 \n\n<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=298 height=52 src="//music.163.com/outchain/player?type=2&id=${mid}&auto=0&height=32"></iframe>`
        );
        return true;
    } catch (error) {
        console.log(error);
        sendMsg(`@${user} :\n 你丫的这首歌太难找了!换一个!`);
        return false;
    }
}

/**
 * 获取小冰无意义的对话
 * @param {string} data 请求对话内容
 * @returns 获取到的回复
 */
async function getChatData(data) {
    try {
        const res = await axios({
            method: 'post',
            url: 'https://ux-plus.xiaoice.com/s_api/game/getresponse?workflow=AIBeingsGFChat',
            headers: {
                accept: '*/*',
                'content-type': ' application/json;charset=UTF-8',
                cookie: conf.xiaobing.cookie,
                origin: 'https://ux-plus.xiaoice.com',
                referer: 'https://ux-plus.xiaoice.com/virtualgirlfriend?authcode=',
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36',
            },
            data: `{"TraceId":"","PartnerName":"","SubPartnerId":"VirtualGF","Content":{"Text":"${data}","Metadata":{}}}`,
        });
        let cb = '';
        if (res.data[0].Content.AudioUrl) {
            cb = `<br><audio controls> <source src="${res.data[0].Content.AudioUrl}" type="audio/mpeg"></audio><hr><p>以下是语音转文字: <br>${res.data[0].Content.Text}</p>`;
        } else {
            cb = res.data[0].Content.Text;
        }
        return cb;
    } catch (error) {
        console.log('不知道什么问题', error);
        return "小冰的cookie过期了呢~\n菜鸡两个开发还不知道怎么自动更新cookie"
    }
}

function getCookie() {
    axios({
        method: 'get',
        url: 'https://ux-plus.xiaoice.com/virtualgirlfriend',
        headers: {
            accept: ' */*',
            'content-type': ' application/json;charset=UTF-8',
            cookie: conf.xiaobing.cookie,
            origin: ' https://ux-plus.xiaoice.com',
            referer: ' https://ux-plus.xiaoice.com/virtualgirlfriend?authcode=',
            'user-agent': ' Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36',
        },
    });
}

module.exports = { updateCookie, wyydiange, getChatData };