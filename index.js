const axios = require('axios');
const { readFileSync, writeFile } = require('fs');
const confPath = './config.json';
axios.defaults.timeout = 5000;
const configInfo = JSON.parse(readFileSync(confPath, 'utf8'));
setInterval(() => {
    getCookie();
    getdata('小冰在吗？')
}, 60 * 60 * 1000); //每次1个小时刷新一次
const WSC = require('w-websocket-client');

let workTime = cnFmt(new Date(configInfo.max_age * 1000 - 28800000), '$[Y年]$[M月]$[D天]$[h小时]$[m分钟]$[S秒]');
let lastTime = new Date()
let lastSetuTime = 0;
const query = require('./database/mysql.js');

function randomSaoHua() {
    return (a => a[Math.floor(Math.random() * a.length)])([
        '人呢？',
        '喂？',
        '歪歪歪？？',
        '理一下我嘛。。',
        '咦，人去哪儿了？',
        '很无聊呀',
        '(孤芳自赏)',
        '（自娱自乐ing）',
        '机器人不要面子的吗',
        '我摸鱼去了，不要打扰我',
        '好冷清啊',
    ]);
}

function autoSaohua() {
    if (configInfo.enableSaohua) {
        let nowTime = new Date()
        if (nowTime - lastTime > 10 * 60 * 1000 && nowTime.getHours() <= 22 && nowTime.getHours() >= 7) {
            sendMsg(randomSaoHua())
        }
    }
}

function cnFmt(time, str) {
    return str.replace(/y/i, time.getFullYear() - 1970)
        .replace(/M/i, time.getMonth())
        .replace(/d/i, time.getDate() - 1)
        .replace(/h/i, time.getHours())
        .replace(/m/i, time.getMinutes())
        .replace(/s/i, time.getSeconds())
        .replace(/\$\[0+[^\]]+\]|\$\[|\]/g, '');
}
let opt = {
    url: `wss://pwl.icu/chat-room-channel?apiKey=${configInfo.apiKey}`,
    open: function() {
        console.log('嘀~你的小冰已上线!');
    },
    close: function() {
        console.log('嘀~你的小冰已掉线!');
    },
    message: async function(data) {
        let dataInfo = JSON.parse(data.toString('utf8'));
        let msg = dataInfo.md;
        let user = dataInfo.userName;
        if (dataInfo.type == 'msg' && ['i', 'hxg'].indexOf(user) < 0) {
            console.log(`收到${user}的消息:${msg}`);
            CallBackMsg(user, msg);
        }
    },
    error: function(err) {
        console.log('嘀~你的小冰尝试连接失败!');
    },
};

async function CallBackMsg(user, msg) {
    if (/^(来吧小冰|滚吧小冰)$/.test(msg.trim())) {
        changeWorkState(user, msg);
        return;
    }
    if (!configInfo.working) {
        console.log('机器人唤醒，但是没有完全唤醒，配置已关闭');
    }
    const diange = /^点歌/g;
    if (diange.test(msg)) {
        wyydiange(user, msg)
        return
    }
    if (!/^(小冰|嘿siri|小爱同学|嘿，siri)/gi.test(msg)) return;

    if (/^TTS|^朗读/i.test(msg)) {
        const link =
            Buffer.from(
                'aHR0cHM6Ly9kaWN0LnlvdWRhby5jb20vZGljdHZvaWNlP2xlPXpoJmF1ZGlvPQ==',
                'base64'
            ) + encodeURIComponent(msg.replace(/^TTS|^朗读/i, '')),
            u = await getCDNLinks(link);
        sendMsg(
                `@${user} :那你可就听好了<br>${
                u === link ? '' : `<br>音频有效期【${workTime}】<br>`
            }<audio src='${u}' controls/>`
        );
        return;
    }
    if (!/^(@hxg|小冰|嘿siri|小爱同学|嘿，siri|@i)/gi.test(msg)) return;

    console.log('叮~你的小冰被唤醒了');
    // 更新上次讲话时间
    lastTime = new Date();
    let message = msg.replace(/小冰|嘿siri|小爱同学|嘿，siri/i, '');
    if (/并说/gi.test(message)) {
        message = message.split(':');
        message = message[message.length - 1];
    }
    message = message.trim();
    const xiaojiejie = /看妞|小姐姐|照片|来个妞/gi;
    const setu = /涩图|色图/g;
    const r18 = /(打开|关闭)r18/g;
    const caidan = /菜单|功能列表/g;
    const watchVideo = /小姐姐视频/;
    const fangChenNi = /^(防沉溺|防沉溺)时长 \d+$/g;
    const lspranking = /^lsp排行/g;
    const saohua=/^(别逼逼?了|闭嘴|人呢|在哪)$/
    if (message === '') {
        if (Math.random() > 0.95) sendMsg(randomSaoHua());
    } else if (watchVideo.test(message)) {
        SetSuTuTimes(user)
        sendMsg(`@${user} :正在获取链接并检测链接活性，请稍等几秒`);
        getVideoLink(async res => {
            const sta = await getCDNLinks(res);
            sendMsg(
                `@${user} :\n > 小姐姐来喽，请在方便的时候查看<br>${
                    res === sta ? '' : `视频有效期【${workTime}】<br>`
                }<br><video controls src='${sta}'/>`
            );
        });
    } else if (fangChenNi.test(message)) {
        changeFangChenNi(user, message);
    } else if (xiaojiejie.test(message)) {
        getXJJ(user);
    } else if (setu.test(message)) {
        getSetu(user, message);
    } else if (r18.test(message)) {
        changeR18(user, message);
    }else if (caidan.test(message)) {
        sendMsg(`@${user} :功能列表:\n
        1. 回复[看妞][小姐姐][来个妞]查看妹子图片\n
        2. 回复[涩图]可查看涩图(可在涩图后跟标签查找对应的标签图片 如: 涩图 原神)\n
        (当前插图模式:${
            configInfo.is18 ? 'lsp模式' : '绅士模式'
        } 可输入[打开/关闭r18]切换)\n
        3. 回复[小姐姐视频]可查看国外小姐姐的视频\n
        4. 全局发送[TTS+文本]或[朗读+文本]即可朗读(无需关键词)\n
        5. 直接发短语即可聊天。\n
        6. 输入[lsp排行]可查看聊天室的lsp排行\n
        7. TIP:为了您的健康和安全，所有的图片视频都已接入“防沉溺系统”，
        链接仅保存【${workTime}】,可通过[防沉溺 时间(单位:秒)]更改\n
        8. [来吧/滚吧小冰]可以设置打开/关闭小冰，当前状态...\n
        ${(a => a[Math.floor(Math.random() * a.length)])([
            'emmm我说关闭你信吗？',
            '肯定是打开啦，不然怎么响应的。。',
            '（未响应）',
            '（蓝屏了）',
            '100 Continue',
            '101 Switching Protocols',
            '103 Early Hints',
            '200 Error',
            '201 Created',
            '202 Accepted',
            '203 Non-Authoritative Information',
            '204 No Content',
            '205 Reset Content',
            '206 Partial Content',
            '300 Multiple Choices',
            '301 Moved Permanently',
            '302 Found',
            '303 See Other',
            '304 Not Modified',
            '307 Temporary Redirect',
            '308 Permanent Redirect',
            '400 Bad Request',
            '401 Unauthorized',
            '402 Payment Required',
            '403 Forbidden',
            '404 Not Found',
            '405 Method Not Allowed',
            '406 Not Acceptable',
            '407 Proxy Authentication Required',
            '408 Request Timeout',
            '409 Conflict',
            '410 Gone',
            '411 Length Required',
            '412 Precondition Failed',
            '413 Payload Too Large',
            '414 URI Too Long',
            '415 Unsupported Media Type',
            '416 Range Not Satisfiable',
            '417 Expectation Failed',
            "418 I'm a teapot",
            '422 Unprocessable Entity',
            '425 Too Early',
            '426 Upgrade Required',
            '428 Precondition Required',
            '429 Too Many Requests',
            '431 Request Header Fields Too Large',
            '451 Unavailable For Legal Reasons',
            '500 Internal Server Error',
            '501 Not Implemented',
            '502 Bad Gateway',
            '503 Service Unavailable',
            '504 Gateway Timeout',
            '505 HTTP Version Not Supported',
            '506 Variant Also Negotiates',
            '507 Insufficient Storage',
            '508 Loop Detected',
            '510 Not Extended',
            '511 Network Authentication Required',
        ])}`);
    } else if(lspranking.test(message)){
        GetLSPRanking(user)
    }else{
        let msg = await getdata(message);
        sendMsg(`@${user} :` + msg);
    }
}

async function getXJJ(user) {
    try {
        SetSuTuTimes(user)
        let nowTime = new Date();
        if(lastSetuTime!= 0 && nowTime - lastSetuTime < 5 * 60 * 1000){
            sendMsg(`@${user} 你别这么猴急嘛！不是刚给你看过！再过${(5 * 60 * 1000 - (nowTime - lastSetuTime))/1000}s，才能看下一张哦！ \n ![lsp](https://pwl.stackoverflow.wiki/2021/12/image-174932da.png)`)
            return;
        }
        lastSetuTime = new Date();
        const res = await axios({
            method: 'get',
            url: 'http://img.btu.pp.ua/random/api.php?type=json',
            encoding: null,
        });
        const u = /^http/.test(res.data.url)
            ? res.data.url
            : `http://img.btu.pp.ua/random/${res.data.url}`;
        const v = await getCDNLinks(u);
        sendMsg(
            `@${user} :\n > 小姐姐来了，小心旁边窥屏哦! \n ${
                v === u
                    ? '\n![小姐姐](' + v
                    : `图片有效期【${workTime}】\n\n![小姐姐](${v}`
            })`
        );
        return true;
    } catch (error) {
        return false;
    }
}
function GetLSPRanking(user){
    query(`SELECT userName,setu_times FROM setu_ranking ORDER BY setu_times DESC LIMIT 0,10`,function(err,vals,fields){
        if(err){
            sendMsg(`@${user} :lsp排行榜查询失败！`)
        }else{
            let msg = `> LSP排行榜 \n`
            vals.forEach((item,index) => {
                msg+=`${index + 1 }.  @${item.userName} 共计查询 ${item.setu_times} 次 ${index == 0 ? '![lsp之王](https://unv-shield.librian.net/api/unv_shield?scale=0.79&txt=lsp%E4%B9%8B%E7%8E%8B&url=https://www.lingmx.com/52pj/images/die.png&backcolor=568289&fontcolor=ffffff)' : ''}\n`
            });
            sendMsg(`@${user} :\n ${msg}`)
        }
    })
}
function SetSuTuTimes(user){
    query(`SELECT * FROM setu_ranking WHERE userName = '${user}'`,function(err,vals,fields){
        if(err){
            console.log(err)
        }else{
            let sql = `INSERT INTO setu_ranking (userName,setu_times,update_datetime,delete_flag) VALUES('${user}',1,now(),0)`
            if(vals.length != 0){
                sql = `UPDATE setu_ranking SET setu_times = setu_times+1 WHERE userName = '${user}'`
            }
            query(sql,function(err,vals,fields){})
        }
       });
}
function changeSaoHua(user, message) {
    if (['Yui', 'taozhiyu'].indexOf(user) >= 0) {

    }
    if (Math.random() > 0.95) sendMsg(randomSaoHua());
    //5%几率回复，彩蛋算是吧
}
async function wyydiange(user,message){
    let msg = message.substr(message.indexOf("点歌")+2).trim();
    msg = encodeURI(msg)
    try {
        const res = await axios({
            method: 'POST',
            headers:{
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
        console.log(error)
        sendMsg(
            `@${user} :\n 你丫的这首歌太难找了!换一个!`
        );
        return false;
    }
}

function changeWorkState(user, message) {
    if (['Yui', 'taozhiyu'].indexOf(user) >= 0) {
        const turnOn = message.match('来吧') >= 0;
        if (configInfo.working) {
            if (turnOn) {
                sendMsg(
                    `@${user} 我明明就在还让我来。。。\n
                我这么没有存在感吗?(／‵Д′)／~ ╧╧\n
                不理你了!`
                );
                configInfo.working = false;
                setTimeout(() => {
                    configInfo.working = true;
                    sendMsg(
                        `@${user} 知错了吗!!\n
                    我不听我不听!`
                    );
                }, 60000);
                return;
            } else configInfo.working = false;
        } else {
            if (!turnOn) {
                sendMsg(
                    `@${user} 我明明都多在旁边瑟瑟发抖不敢说话了，\n
                还让我闭嘴。。。\n
                我有这么讨厌吗?\n
                不让我说我偏说!`
                );
                configInfo.working = false;
                setTimeout(() => {
                    sendMsg(`@${user} 知错了吗!!`);
                    setTimeout(() => {
                        sendMsg(`@${user} 我不听我不听!`);
                        setTimeout(() => {
                            sendMsg(`@${user} 呵,男人`);
                        }, 5000);
                    }, 3000);
                }, 3000);
                return;
            } else configInfo.working = true;
        }
        writeFile(
            confPath,
            JSON.stringify(configInfo, null, 4),
            'utf8',
            err => {
                if (err) {
                    sendMsg(
                        `@${user} 修改出错! 请查看日志，机器人已停止运行\n
                        当前状态:${
                            configInfo.working ? '[打开]✅' : '[关闭]❌'
                        }(机器人都停止运行了,这个还有什么意义吗喂?)`
                    );
                    throw err;
                }
                sendMsg(
                    `@${user} 修改成功，当前状态:${
                        configInfo.working ? '[打开]✅' : '[关闭]❌'
                    }`
                );
            }
        );
    } else
        sendMsg(
            `@${user} 暂无权限，当前状态:${
                configInfo.working ? '[打开]✅' : '[关闭]❌'
            }`
        );
}

function changeFangChenNi(user, message) {
    if (['Yui', 'taozhiyu'].indexOf(user) >= 0) {
        let max_age = message.match(/\d+/)[0];
        console.log(max_age)
        if(max_age < 60){
            sendMsg(`@${user} :想啥呢！最少1分钟！`)
            return;
        }
        configInfo.max_age = max_age;
        writeFile(
            confPath,
            JSON.stringify(configInfo, null, 4),
            'utf8',
            err => {
                if (err) {
                    sendMsg(
                        `@${user} :修改出错! 请查看日志，机器人已停止运行\n
                        当前防沉溺时间:${workTime}(机器人都停止运行了,这个还有什么意义吗喂?)`
                    );
                    throw err;
                }
                workTime = cnFmt(new Date(configInfo.max_age * 1000 - 28800000),'$[Y年]$[M月]$[D天]$[h小时]$[m分钟]$[S秒]');
                sendMsg(`@${user} :修改成功，当前防沉溺时间:${workTime}`);
            }
        );
    } else sendMsg(`@${user} :暂无权限，当前防沉溺时间:${workTime}`);
}

function changeR18(user, message) {
    if (['Yui', 'taozhiyu','csfwff','adlered'].indexOf(user) >= 0) {
        configInfo.is18 = !message.match('关闭');
        writeFile(
            confPath,
            JSON.stringify(configInfo, null, 4),
            'utf8',
            err => {
                if (err) {
                    sendMsg(
                        `@${user} :修改出错! 请查看日志，机器人已停止运行\n
                        当前插图模式:${
                            configInfo.is18 ? 'lsp模式' : '绅士模式'
                        }(机器人都停止运行了,这个还有什么意义吗喂?)`
                    );
                    throw err;
                }
                sendMsg(
                    `@${user} :修改成功，当前插图模式:${
                        configInfo.is18 ? 'lsp模式' : '绅士模式'
                    }`
                );
            }
        );
    } else
        sendMsg(
            `@${user} :暂无权限，当前插图模式:${
                configInfo.is18 ? 'lsp模式' : '绅士模式'
            }`
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

async function getdata(data) {
    try {
        const res = await axios({
            method: 'post',
            url: 'https://ux-plus.xiaoice.com/s_api/game/getresponse?workflow=AIBeingsGFChat',
            headers: {
                accept: '*/*',
                'content-type': ' application/json;charset=UTF-8',
                cookie: configInfo.cookie,
                origin: 'https://ux-plus.xiaoice.com',
                referer:'https://ux-plus.xiaoice.com/virtualgirlfriend?authcode=',
                'user-agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36',
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
        return '已读，不回';
    }
}

async function getSetu(user, msg) {
    SetSuTuTimes(user)
    let nowTime = new Date();
    if(lastSetuTime!= 0 && nowTime - lastSetuTime < 5 * 60 * 1000){
        sendMsg(`@${user} 你别这么猴急嘛！不是刚给你看过！再过${(5 * 60 * 1000 - (nowTime - lastSetuTime))/1000}s，才能看下一张哦！ \n ![lsp](https://pwl.stackoverflow.wiki/2021/12/image-174932da.png)`)
        return;
    }
    lastSetuTime = new Date();
    msg = msg.trim();
    try {
        const res = await axios({
            method: 'get',
            url: encodeURI(
                `https://api.lolicon.app/setu/v2?r18=${
                    configInfo.is18 ? 1 : 0
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
                        : `<br>链接有效期为【${workTime}】`
                }<br>![涩图](${sta})`
            );
        }
        return res.data;
    } catch (error) {
        sendMsg(`@${user} :已读，不回!`);
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
            'user-agent':' Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36',
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
                max_age: configInfo.max_age, //默认14400，有效期4小时
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
    // 每5分钟检测一次
    setInterval(() => {
        autoSaohua() 
    }, 5 * 60 * 1000);
}
init();