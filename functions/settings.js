const { sendMsg } = require('./chat');
const { formatTime } = require('./utils');
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

        sendMsg(
            `@${user} ${
                turnOff ? '好啦好啦，我不说了还不行吗:doge:' : '我在这:huaji:'
            }`
        );
    } else sendMsg(`@${user} 你以为谁都可以设置的吗？\n我就不听，略略略略略`);
    // if (Math.random() > 0.95) sendMsg(getSaohua());
    //5%几率回复，彩蛋算是吧
}
/**
 * 更改机器人开关状态
 * @param {string} user 用户名
 * @param {string} message 消息
 */
function changeWorkState(user, message) {
    if (conf.admin.includes(user)) {
        const turnOn = message.includes('来吧');
        if (conf.rob.working) {
            if (turnOn) {
                sendMsg(
                    `@${user} 我明明就在还让我来。。。\n
                我这么没有存在感吗?(／‵Д′)／~ ╧╧\n
                不理你了!`
                );
                conf.rob.offWorking = true;
                setTimeout(() => {
                    conf.rob.working = true;
                    conf.rob.offWorking = false;
                    sendMsg(`@${user} 知错了吗!!\n我不听我不听!`);
                }, 60000);
                return;
            } else conf.rob.working = false;
        } else {
            if (!turnOn) {
                sendMsg(
                    `@${user} 我明明都多在旁边瑟瑟发抖不敢说话了，\n
                还让我闭嘴。。。\n\n
                我有这么讨厌吗?\n\n
                不让我说我偏说!`
                );
                conf.rob.working = false;
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
            } else conf.rob.working = true;
        }
        writeConfig(conf, err => {
            if (err) {
                sendMsg(
                    `@${user} 修改出错! 请查看日志，机器人已停止运行\n
                        当前状态:${
                            conf.rob.working ? '[打开]✅' : '[关闭]❌'
                        }(机器人都停止运行了,这个还有什么意义吗喂?)`
                );
                throw err;
            }
            sendMsg(
                `@${user} 修改成功，当前状态:${
                    conf.rob.working ? '[打开]✅' : '[关闭]❌'
                }`
            );
        });
    } else
        sendMsg(
            `@${user} 宁配吗?宁有权限吗，当前状态:${
                conf.rob.working ? '[打开]✅' : '[关闭]❌'
            }`
        );
}

/**
 * 更改防沉溺CDN时长
 * @param {string} user 用户名
 * @param {string} message 消息
 */
function changeFangChenNi(user, message) {
    if (conf.admin.includes(user)) {
        let max_age = message.match(/\d+/)[0];
        console.log(max_age);
        if (max_age < 1) {
            sendMsg(`@${user} :想啥呢！最少1分钟！`);
            return;
        }
        conf.api.max_age = max_age;
        writeConfig(conf, err => {
            if (err) {
                sendMsg(
                    `@${user} :修改出错! 请查看日志，机器人已停止运行\n
                        当前防沉溺时间:${formatTime(
                            conf.api.max_age * 60
                        )}(机器人都停止运行了,这个还有什么意义吗喂?)`
                );
                throw err;
            }
            sendMsg(
                `@${user} :修改成功，当前防沉溺时间:${formatTime(
                    conf.api.max_age * 60
                )}`
            );
        });
    } else
        sendMsg(
            `@${user} :暂无权限，当前防沉溺时间:${formatTime(
                conf.api.max_age * 60
            )}`
        );
}

/**
 * 更改防沉溺等待时间
 * @param {string} user 用户名
 * @param {string} message 消息
 */
function changeFangChenNiWait(user, message) {
    if (conf.admin.includes(user)) {
        let max_age = message.match(/\d+/)[0];
        console.log(max_age);
        if (max_age < 1) {
            sendMsg(`@${user} :想啥呢！最少1分钟！`);
            return;
        }
        conf.rob.lspWaitingTime = max_age;
        writeConfig(conf, err => {
            if (err) {
                sendMsg(
                    `@${user} :修改出错! 请查看日志，机器人已停止运行\n
                        当前防沉溺等待:${formatTime(
                            conf.rob.lspWaitingTime * 60
                        )}(机器人都停止运行了,这个还有什么意义吗喂?)`
                );
                throw err;
            }
            sendMsg(
                `@${user} :修改成功，当前防沉溺等待:${formatTime(
                    conf.rob.lspWaitingTime * 60
                )}`
            );
        });
    } else
        sendMsg(
            `@${user} :暂无权限，当前防沉溺等待:${formatTime(
                conf.rob.lspWaitingTime * 60
            )}`
        );
}

/**
 * 更改R18开关
 * @param {string} user 用户名
 * @param {string} message 消息
 */
function changeR18(user, message) {
    if (conf.admin.includes(user)) {
        conf.rob.is18 = !message.match('关闭');
        writeConfig(conf, err => {
            if (err) {
                sendMsg(
                    `@${user} :修改出错! 请查看日志，机器人已停止运行\n
                        当前插图模式:${
                            conf.rob.is18 ? 'lsp模式' : '绅士模式'
                        }(机器人都停止运行了,这个还有什么意义吗喂?)`
                );
                throw err;
            }
            sendMsg(
                `@${user} :修改成功，当前插图模式:${
                    conf.rob.is18 ? 'lsp模式' : '绅士模式'
                }`
            );
        });
    } else
        sendMsg(
            `@${user} :暂无权限，当前插图模式:${
                conf.rob.is18 ? 'lsp模式' : '绅士模式'
            }`
        );
}

/**
 * 添加删除管理人员
 * @param {string} user 用户名
 * @param {string} message 消息
 */
function setAdmin(user, message) {
    if (conf.admin.includes(user)) {
        let isAdd = !message.match('删除');
        let uname = message.substr(4).trim();
        let index = conf.admin.indexOf(uname);
        if (isAdd) {
            if (index >= 0) {
                sendMsg(
                    `@${user} :${uname}已经是管理了！别加了！当前管理员: ${conf.admin}`
                );
                return;
            } else conf.admin.push(uname);
        } else {
            if (['Yui', 'taozhiyu'].includes(uname)) {
                sendMsg(`@${user} :超管不可删除！当前管理员: ${conf.admin}`);
                return;
            } else conf.admin.splice(index, 1);
        }
        writeConfig(conf, err => {
            if (err) {
                sendMsg(
                    `@${user} :修改出错! 请查看日志，机器人已停止运行\n
                        当前当前管理员: ${conf.admin}(机器人都停止运行了,这个还有什么意义吗喂?)`
                );
                throw err;
            }
            sendMsg(`@${user} :修改成功，当前管理员: ${conf.admin}`);
        });
    } else {
        sendMsg(`@${user} :暂无权限，当前管理员: ${conf.admin}`);
    }
}
module.exports = {
    changeSaoHua,
    changeWorkState,
    changeFangChenNi,
    changeR18,
    changeFangChenNiWait,
    setAdmin,
};
