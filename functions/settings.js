const { sendMsg } = require('./chat');
const { formatTime, removeArr } = require('./utils');
const { configInfo: conf, writeConfig } = require('./config');
/**
 * 更改骚话配置
 * @param {string} user 用户名
 * @param {string} message 消息
 */
function changeSaoHua(user, message) {
    if (conf.admin.includes(user)) {
        const turnOff = message.match(/^(别逼逼?了|闭嘴)/);
        conf.rob.enableSaohua = !turnOff;
        return turnOff ? '好啦好啦，我不说了还不行吗:doge:' : '我在这:huaji:'
    } else {
        return "你以为谁都可以设置的吗？\n我就不听，略略略略略"
    }
}
/**
 * 更改机器人开关状态
 * @param {string} user 用户名
 * @param {string} message 消息
 */
function changeWorkState(user, message) {
    return new Promise((resolve, reject) => {
        if (conf.admin.includes(user)) {
            const turnOn = message.includes('来吧');
            if (turnOn) {
                conf.rob.working = true;
            } else {
                conf.rob.working = false;
            }
            writeConfig(conf, err => {
                if (err) {
                    console.log(JSON.stringify(err))
                    resolve(`修改出错! 请查看日志，机器人已停止运行 \n 当前状态:${conf.rob.working ? '[打开]✅' : '[关闭]❌'}(机器人都停止运行了,这个还有什么意义吗喂?)`)
                } else {
                    resolve(`修改成功，当前状态:${conf.rob.working ? '[打开]✅' : '[关闭]❌'}`)
                }
            });
        } else {
            resolve(`宁配吗?宁有权限吗，当前状态:${conf.rob.working ? '[打开]✅' : '[关闭]❌'}`)
        }
    })
}

/**
 * 更改防沉溺CDN时长
 * @param {string} user 用户名
 * @param {string} message 消息
 */
function changeFangChenNi(user, message) {
    return new Promise((resolve, reject) => {
        if (conf.admin.includes(user)) {
            let max_age = message.match(/\d+/)[0];
            console.log(max_age);
            if (max_age < 1) {
                return "想啥呢！最少1分钟！";
            }
            conf.api.max_age = max_age;
            writeConfig(conf, err => {
                if (err) {
                    console.log(JSON.stringify(err))
                    resolve(`修改出错! 请查看日志，机器人已停止运行 \n 当前防沉溺时间:${formatTime(conf.api.max_age * 60)}(机器人都停止运行了,这个还有什么意义吗喂?)`)
                } else {
                    resolve(`修改成功，当前防沉溺时间:${formatTime(conf.api.max_age * 60)}`)
                }

            });
        } else {
            resolve(`暂无权限，当前防沉溺时间:${formatTime(conf.api.max_age * 60)}`)
        }
    })
}

/**
 * 更改防沉溺等待时间
 * @param {string} user 用户名
 * @param {string} message 消息
 */
function changeFangChenNiWait(user, message) {
    return new Promise((resolve, reject) => {
        if (conf.admin.includes(user)) {
            let max_age = message.match(/\d+/)[0];
            console.log(max_age);
            if (max_age < 1) {
                return "想啥呢！最少1分钟！";
            }
            conf.rob.lspWaitingTime = max_age;
            writeConfig(conf, err => {
                if (err) {
                    console.log(JSON.stringify(err))
                    resolve(`修改出错! 请查看日志，机器人已停止运行\n当前防沉溺等待:${formatTime(conf.rob.lspWaitingTime * 60)}(机器人都停止运行了,这个还有什么意义吗喂?)`)
                } else {
                    resolve(`修改成功，当前防沉溺等待:${formatTime(conf.rob.lspWaitingTime * 60)}`)
                }
            });
        } else {
            resolve(`暂无权限，当前防沉溺等待:${formatTime(conf.rob.lspWaitingTime * 60)}`)
        }
    })
}


/**
 * 更改R18开关
 * @param {string} user 用户名
 * @param {string} message 消息
 */
function changeR18(user, message) {
    return new Promise((resolve, reject) => {
        if (conf.admin.includes(user)) {
            conf.rob.is18 = !message.match('关闭');
            writeConfig(conf, err => {
                if (err) {
                    console.log(JSON.stringify(err))
                    resolve(`修改出错! 请查看日志，机器人已停止运行 \n 当前插图模式:${conf.rob.is18 ? 'lsp模式' : '绅士模式'}(机器人都停止运行了,这个还有什么意义吗喂?)`)
                } else {
                    resolve(`修改成功，当前插图模式:${conf.rob.is18 ? 'lsp模式' : '绅士模式'}`)
                }
            });
        } else {
            resolve(`暂无权限，当前插图模式:${conf.rob.is18 ? 'lsp模式' : '绅士模式'}`)
        }
    })
}

/**
 * 添加删除管理人员
 * @param {string} user 用户名
 * @param {string} message 消息
 */
function setAdmin(user, message) {
    return new Promise((resolve, reject) => {
        if (conf.admin.includes(user)) {
            let isAdd = !message.match('删除');
            let uname = message.substr(4).trim();
            let index = conf.admin.indexOf(uname);
            if (isAdd) {
                if (index >= 0) {
                    resolve(`${uname}已经是管理了！别加了！当前管理员: ${conf.admin}`);
                } else {
                    conf.admin.push(uname);
                }
            } else {
                if (['Yui', 'taozhiyu'].includes(uname)) {
                    resolve(`超管不可删除！当前管理员: ${conf.admin}`);
                } else if (index >= 0) {
                    conf.admin.splice(index, 1)
                } else {
                    resolve(`${uname}不是管理了！不用删除！当前管理员: ${conf.admin}`);
                }
            }
            writeConfig(conf, err => {
                if (err) {
                    resolve(`修改出错! 请查看日志，机器人已停止运行\n 当前当前管理员: ${conf.admin}(机器人都停止运行了,这个还有什么意义吗喂?)`)
                } else {
                    resolve(`修改成功，当前管理员: ${conf.admin}`)
                }

            });
        } else {
            resolve(`暂无权限，当前管理员: ${conf.admin}`)
        }
    })
}
module.exports = {
    changeSaoHua,
    changeWorkState,
    changeFangChenNi,
    changeR18,
    changeFangChenNiWait,
    setAdmin,
};