var is18 = false;
import axios from 'axios';
import { readFileSync, writeFile } from 'fs';
const confPath = './config.json';
axios.defaults.timeout = 5000;
const configInfo = JSON.parse(readFileSync(confPath, 'utf8'));
setInterval(() => {
    getCookie();
}, 6900000); //每次2个小时刷新一次
import WSC from 'w-websocket-client';
let opt = {
    url: `wss://pwl.icu/chat-room-channel?apiKey=${configInfo.apiKey}`,
    open: function () {
        console.log('嘀~你的小冰已上线!');
        // sendMsg('嘀~你的小冰已上线!');
    },
    close: function () {
        console.log('嘀~你的小冰已掉线!');
        // sendMsg('嘀~你的小冰已掉线!');
    },
    message: async function (data) {
        // let json = JSON.stringify(data, null, 2)
        let dataInfo = JSON.parse(data.toString('utf8'));
        let msg = dataInfo.md;
        let user = dataInfo.userName;
        let getIce = /^(@hxg|小冰|嘿siri|小爱同学|嘿，siri|@i)/gi;
        // let ruleCB =
        // /([\u96f6\u4e00\u4e8c\u4e09\u56db\u4e94\u516d\u4e03\u516b\u4e5d\u5341\u767e\u5343\u4e07]{2})|([^\d]|^)[1-5]*[0-9][^\d]*[摸鱼|闯关].*?过/;
        if (dataInfo.type == 'msg' && ['i', 'hxg'].indexOf(user) < 0) {
            console.log(`收到${user}的消息:${msg}`);
            // ruleCB.test(msg) &&
            //     sendMsg(`@${user} https://pwl.icu/article/1635664654563`);
            getIce.test(msg) && CallBackMsg(user, msg);
            /^TTS|^朗读/i.test(msg) &&
                sendMsg(`@${user} 那你可就听好了<br>
            <audio src='${await getCDNLinks(
                Buffer.from(
                    'aHR0cHM6Ly9kaWN0LnlvdWRhby5jb20vZGljdHZvaWNlP2xlPXpoJmF1ZGlvPQ==',
                    'base64'
                ) + encodeURIComponent(msg.replace(/^TTS|^朗读/i, ''))
            )}' controls></audio>`);
        }
    },
    error: function (err) {
        console.log('嘀~你的小冰尝试连接失败!');
        // sendMsg('嘀~你的小冰尝试连接失败!');
    },
};

function CallBackMsg(user, msg) {
    console.log('叮~你的小冰被唤醒了');
    let message = msg.replace(/@hxg|小冰|嘿siri|小爱同学|嘿，siri|@i/i, '');
    if (/并说/gi.test(message)) {
        message = message.split(':');
        message = message[message.length - 1];
    }
    const xiaojiejie = /看妞|小姐姐|照片|来个妞/gi;
    const setu = /涩图|色图/g;
    const r18 = /(打开|关闭)r18/g;
    const caidan = /菜单|功能列表/g;
    const watchVideo = /小姐姐视频/;
    if (watchVideo.test(message)) {
        sendMsg(`@${user} 正在获取链接并检测链接活性，请稍等几秒`);
        getVideoLink(async res =>
            sendMsg(
                `@${user} 小姐姐来喽，请在方便的时候查看<br><video controls src='${await getCDNLinks(
                    res
                )}'/>`
            )
        );
    } else if (xiaojiejie.test(message)) {
        getXJJ(user);
    } else if (setu.test(message)) {
        getSetu(user, message);
    } else if (r18.test(message)) {
        changeR18(user, message);
    } else if (caidan.test(message)) {
        sendMsg(`@${user} 功能列表:\n
        1. 回复[看妞][小姐姐][来个妞]查看妹子图片\n
        2. 回复[涩图]可查看涩图(可在涩图后跟标签查找对应的标签图片 如: 涩图 原神)\n
        [当前插图模式:${
            is18 ? 'lsp模式' : '绅士模式'
        } 可输入 打开/关闭r18 切换]\n
        3. 回复[小姐姐视频]可查看国外小姐姐的视频\n
        4. 直接发短语可聊天，不可发he tui!`);
    } else {
        getdata(user, message);
    }
}

async function getXJJ(user) {
    try {
        const res = await axios({
            method: 'get',
            url: 'http://img.btu.pp.ua/random/api.php?type=json',
            encoding: null,
        });
        sendMsg(
            `@${user} \n > 小姐姐来了，小心旁边窥屏哦! \n ![小姐姐](${await getCDNLinks(
                /^http/.test(res.data.url)
                    ? res.data.url
                    : `http://img.btu.pp.ua/random/${res.data.url}`
            )})`
        );
        return true;
    } catch (error) {
        return false;
    }
}

function changeR18(user, message) {
    if (['Yui', 'taozhiyu'].indexOf(user) >= 0) {
        is18 = !message.match('关闭');
        sendMsg(
            `@${user} 修改成功，当前插图模式:${is18 ? 'lsp模式' : '绅士模式'}`
        );
    } else
        sendMsg(
            `@${user} 暂无权限，当前插图模式:${is18 ? 'lsp模式' : '绅士模式'}`
        );
}

async function sendMsg(msg) {
    try {
        await axios({
            method: 'post',
            url: 'https://pwl.icu/chat-room/send',
            data: {
                apiKey: configInfo.apiKey,
                content: msg,
            },
        });
    } catch (error) {}
}

async function getKey() {
    try {
        const res = await axios({
            method: 'post',
            url: 'https://pwl.icu/api/getKey',
            data: {
                nameOrEmail: configInfo.nameOrEmail,
                userPassword: configInfo.userPassword,
            },
        });
        console.log(res.data);
        if (res.data.Key) {
            configInfo.apiKey = res.data.Key;
            writeFile(
                confPath,
                JSON.stringify(configInfo, null, 4),
                'utf8',
                err => {
                    if (err) throw err;
                    console.log('配置更新完成');
                }
            );
        } else throw 'apiKey错误，请检查用户名和密码（md5）';
        return res.data.Key;
    } catch {
        return '已读，不回';
    }
}

function checkUser() {
    if (configInfo.apiKey === '') return false;
    const config = {
        method: 'get',
        url: `https://pwl.icu/api/user?apiKey=${configInfo.apiKey}`,
    };
    return axios(config)
        .then(res => res.data.code === 0)
        .catch(() => {
            return '已读，不回';
        });
}

async function getdata(user, data) {
    try {
        const res = await axios({
            method: 'post',
            url: 'https://ux-plus.xiaoice.com/s_api/game/getresponse?workflow=AIBeingsGFChat',
            headers: {
                accept: '*/*',
                'content-type': ' application/json;charset=UTF-8',
                cookie: configInfo.cookie,
                origin: 'https://ux-plus.xiaoice.com',
                referer:
                    'https://ux-plus.xiaoice.com/virtualgirlfriend?authcode=',
                'user-agent':
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36',
            },
            data: `{"TraceId":"","PartnerName":"","SubPartnerId":"VirtualGF","Content":{"Text":"${data}","Metadata":{}}}`,
        });
        // console.log(res.data[0]);
        let cb = '';
        if (res.data[0].Content.AudioUrl) {
            cb = `<br><audio controls> <source src="${cb.AudioUrl}" type="audio/mpeg"></audio><hr><p>以下是语音转文字: <br>${cb.Text}</p>`;
        } else {
            cb = res.data[0].Content.Text;
        }
        sendMsg(`@${user} ` + cb);
        return true;
    } catch (error) {
        return '已读，不回';
    }
}

async function getSetu(user, msg) {
    msg = msg.trim();
    try {
        const res = await axios({
            method: 'get',
            url: encodeURI(
                `https://api.lolicon.app/setu/v2?r18=${is18}&size=small${
                    msg.split(' ')[1] ? `&tag=${msg.split(' ')[1]}` : ''
                }`
            ),
            headers: {
                'user-agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36',
            },
        });
        if (res.data.data.length == 0) {
            sendMsg(`@${user} 想啥呢，没有!`);
        } else {
            sendMsg(
                `@${user} \n > 涩图来了!看不到的请科学上网! \n![涩图](${await getCDNLinks(
                    res.data.data[0].urls.small,
                    true
                )})`
            );
        }
        return res.data;
    } catch (error) {
        sendMsg(`@${user} 已读，不回!`);
        return error;
    }
}

function getCookie() {
    axios({
        method: 'get',
        url: 'https://ux-plus.xiaoice.com/virtualgirlfriend',
        headers: {
            accept: ' */*',
            'content-type': ' application/json;charset=UTF-8',
            cookie: configInfo.cookie,
            origin: ' https://ux-plus.xiaoice.com',
            referer: ' https://ux-plus.xiaoice.com/virtualgirlfriend?authcode=',
            'user-agent':
                ' Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36',
        },
    });
}

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
                    .catch(a => {
                        getVideoLink(callback);
                    });
            } else getVideoLink(callback);
        })
        .catch(e => {
            console.log('链接获取失败');
            getVideoLink(callback);
        });
}

async function getCDNLinks(url, isForce = false) {
    try {
        const resp = await axios({
            method: 'post',
            url: 'https://proxy.taozhiyu.workers.dev/request/',
            data: JSON.stringify({
                method: 'GET',
                url,
                token: configInfo.token,
                max_age: 4 * 60 * 60, //有效期4小时
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

async function init() {
    if (!(await checkUser())) {
        console.log('CK已过期');
        await getKey();
    }
    let wsc = new WSC(opt);
}
init();
