var is18 = 0;
const axios = require('axios');
const fs = require('fs')
const Koa = require('koa')
const app = new Koa();
const configInfo = JSON.parse(fs.readFileSync('./cookie.json', 'utf8'))
setInterval(() => { getCookie() }, 6900000) //每次2个小时刷新一次
const WSC = require('w-websocket-client');
var apiKey = "k35GtPaPlVYWb8MKp0E7iAdrWcv4lzLS"
var lastTime = new Date()
let opt = {
    url: `wss://pwl.icu/chat-room-channel?apiKey=${apiKey}`,
    open: function() {
        console.log('嘀~你的小冰已上线！')
        sendMsg('嘀~你的小冰已上线！')
    },
    close: function() {
        console.log('嘀~你的小冰已掉线！')
        sendMsg('嘀~你的小冰已掉线！')
    },
    message: function(data) {
        // let json = JSON.stringify(data, null, 2)
        let dataInfo = data.toString('utf8');
        dataInfo = JSON.parse(dataInfo)
        let msg = dataInfo.md;
        let user = dataInfo.userName;
        let getIce = new RegExp(/^(@hxg|小冰|嘿siri|小爱同学|嘿，siri)/gi);
        let ruleCB = new RegExp(/([\u96f6\u4e00\u4e8c\u4e09\u56db\u4e94\u516d\u4e03\u516b\u4e5d\u5341\u767e\u5343\u4e07]{2})|([^\d]|^)[1-5]*[0-9][^\d]*[摸鱼|闯关].*?过/)
        if (dataInfo.type == "msg" && ["i", "hxg"].indexOf(user) < 0) {
            console.log(`收到${user}的消息：${msg}`)
            ruleCB.test(msg) && sendMsg(`@${user} https://pwl.icu/article/1635664654563`)
            getIce.test(msg) && CallBackMsg(user, msg)
        }

    },
    error: function(err) {
        console.log('嘀~你的小冰尝试连接失败！')
        sendMsg('嘀~你的小冰尝试连接失败！')
    },
}

function CallBackMsg(user, msg) {
    console.log("叮~你的小冰被唤醒了")
    let message = msg.replace(/@hxg|小冰|嘿siri|小爱同学|嘿，siri/i, "");
    if (/并说/gi.test(message)) {
        message = message.split(":");
        message = message[message.length - 1]
    }
    let xiaojiejie = new RegExp(/看妞|小姐姐|照片|来个妞/gi);
    let setu = new RegExp(/涩图|色图/g);
    let r18 = new RegExp(/[打开|关闭]r18/g);
    let caidan = new RegExp(/菜单|功能列表/g)
    if (xiaojiejie.test(message)) {
        getXJJ(user)
    } else if (setu.test(message)) {
        getSetu(user, message)

    } else if (r18.test(message)) {
        changeR18(user, message)
    } else if (caidan.test(message)) {
        sendMsg(`@${user} 功能列表： \n 
        1.回复我要看妞|小姐姐|照片|来个妞等查看妹子图片 \n 
        2.回复涩图可查看涩图(可在涩图后跟标签查找对应的标签图片 如： 涩图 原神) \n 
        3. 当前插图模式：${is18 == 0 ? '绅士模式' : 'lsp模式'} 可输入 打开/关闭r18 切换 \n 
        4. 直接发短语可聊天，不可发he tui！`)
    } else {
        getdata(user, message)
    }

}

function getXJJ(user) {
    var config = {
        method: 'get',
        url: 'http://img.btu.pp.ua/random/api.php?type=json',
        encoding: null,
    };
    return axios(config).then(
            (res) => {
                if (/^http/.test(res.data.url)) {
                    sendMsg(`@${user} \n > 小姐姐来了，小心旁边窥屏哦！ \n ![小姐姐](${ res.data.url })`)
                } else {
                    sendMsg(`@${user} \n > 小姐姐来了，小心旁边窥屏哦！ \n ![小姐姐](http://img.btu.pp.ua/random/${ res.data.url })`)
                }
                return true
            }
        )
        .catch(function(error) {
            // console.log(error)
            return false
        });
}

function changeR18(user, message) {
    let cb = "暂无权限"
    if (user == "Yui") {
        is18 = 1
    }
}

function sendMsg(msg) {
    var config = {
        method: 'post',
        url: 'https://pwl.icu/chat-room/send',
        data: {
            apiKey: apiKey,
            content: msg
        }
    };
    return axios(config).then(
            (res) => {
                // console.log(res.data)
                return true
            }
        )
        .catch(function(error) {
            // console.log(error)
            return false
        });
}

function getKey() {
    var config = {
        method: 'post',
        url: 'https://pwl.icu/api/getKey',
        data: {
            nameOrEmail: configInfo.nameOrEmail,
            userPassword: configInfo.userPassword
        }
    };
    return axios(config).then(
            (res) => {
                console.log(res.data);
                apiKey = res.data.Key
                return res.data.Key
            }
        )
        .catch(function(error) {
            return "已读，不回"
        });

}

function checkUser() {
    var config = {
        method: 'get',
        url: `https://pwl.icu/api/user?apiKey=${apiKey}`
    };
    return axios(config).then(
            (res) => {
                if (res.data.code == 0) {
                    return true
                } else {
                    return false
                }
            }
        )
        .catch(function(error) {
            return "已读，不回"
        });

}

function getdata(user, data) {
    var data = `{"TraceId":"","PartnerName":"","SubPartnerId":"VirtualGF","Content":{"Text":"${data}","Metadata":{}}}`
    var config = {
        method: 'post',
        url: 'https://ux-plus.xiaoice.com/s_api/game/getresponse?workflow=AIBeingsGFChat',
        headers: {
            'accept': ' */*',
            'content-type': ' application/json;charset=UTF-8',
            'cookie': configInfo.cookie,
            'origin': ' https://ux-plus.xiaoice.com',
            'referer': ' https://ux-plus.xiaoice.com/virtualgirlfriend?authcode=',
            'user-agent': ' Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36'
        },
        data: data
    };
    return axios(config).then(
            (res) => {
                // console.log(res.data[0]);
                let cb = "";
                if (res.data[0].Content.AudioUrl) {
                    cb = `<br><audio controls> <source src="${cb.AudioUrl}" type="audio/mpeg"></audio><hr><p>以下是语音转文字: <br>${cb.Text}</p>`
                } else {
                    cb = res.data[0].Content.Text
                }
                sendMsg((`@${user} ` + cb))
                return true
            }
        )
        .catch(function(error) {
            return "已读，不回"
        });
}

function getSetu(user, msg) {
    msg = msg.trim();
    let url = `https://api.lolicon.app/setu/v2?r18=${is18}&size=small`;
    if (msg.split(" ")[1]) {
        url = `https://api.lolicon.app/setu/v2?r18=${is18}&size=small&tag=${msg.split(" ")[1]}`
    }
    url = encodeURI(url)
    config = {
        method: 'get',
        url: url,
        headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36'
        }
    };
    return axios(config).then(
            (res) => {
                if (res.data.data.length == 0) {
                    sendMsg(`@${user} 想啥呢，没有！`)
                } else {
                    sendMsg(`@${user} \n > 涩图来了！看不到的请科学上网！ \n![涩图](https://proxy.onesrc.workers.dev/?url=${res.data.data[0].urls.small})`)
                }
                return res.data
            }
        )
        .catch(function(error) {
            sendMsg(`@${user} 已读，不回！`)
            return error
        });
}

function getUrl(url) {
    return config = {
        method: 'get',
        url: url,
        headers: {
            'accept': ' */*',
            'content-type': ' application/json;charset=UTF-8',
            'cookie': configInfo.cookie,
            'origin': ' https://ux-plus.xiaoice.com',
            'referer': ' https://ux-plus.xiaoice.com/virtualgirlfriend?authcode=',
            'user-agent': ' Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36'
        }
    };
}
async function getCookie() {
    var url = 'https://ux-plus.xiaoice.com/virtualgirlfriend'
    var config = await getUrl(url)
    axios(config).then(console.log(1))
}

async function init() {
    if (!await checkUser()) {
        console.log("CK已过期")
        apiKey = await getKey();
        let wsc = new WSC(opt)
    } else {
        let wsc = new WSC(opt)
    }


}
init()