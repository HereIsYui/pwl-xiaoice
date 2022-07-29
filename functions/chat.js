const axios = require('axios');
var WebSocketClient = require('websocket').client;
const {
	configInfo: conf,
	writeConfig
} = require('./config');
const {
	getSaohua,
	EmptyCall
} = require('./strings');

const {
	sendMsg
} = require('./utils');

const {
	GlobalRuleList,
	XiaoIceRuleList
} = require('./rules')

const {
	GetActivityInfo
} = require('./other_apis')

var oIdList = [];
var client = new WebSocketClient();
client.on('connectFailed', function (error) {
	console.log('Connect Error: ' + error.toString());
});
client.on('connect', function (connection) {
	console.log('嘀~你的小冰已上线!');
	setInterval(() => {
		connection.sendUTF("-hb-")
	}, 3 * 60 * 1000)
	connection.on('error', function (error) {
		console.log("Connection Error: " + error.toString());
		console.log('嘀~你的小冰尝试连接失败!');
	});
	connection.on('close', function () {
		console.log('嘀~你的小冰已掉线!');
	});
	connection.on('message', async function (message) {
		if (message.type === 'utf8') {
			const data = message.utf8Data;
			const dataInfo = JSON.parse(data.toString('utf8'));
			if (dataInfo.type !== 'msg' || !dataInfo.md) return;
			//非聊天消息
			const msg = dataInfo.md.trim();
			const oId = dataInfo.oId;
			oIdList.unshift(oId);
			if (oIdList.length > 500) {
				oIdList.splice(250, oIdList.length - 1);
			}
			const user = dataInfo.userName;
			if (!['xiaoIce'].includes(user)) {
				console.log(`收到${user}的消息:${msg}`);
				let cb = await CallBackMsg(user, msg);
				sendMsg(cb)
			}
		}

	});
});
// client.connect(`wss://fishpi.cn/chat-room-channel?apiKey=${conf.PWL.apiKey}`);

/**
 * 接收到的消息判断分发
 * @param {string} user 用户名
 * @param {string} msg 接收到用户的消息
 */
var isRedPacket = false;
async function CallBackMsg(user, msg, key) {
	updateLastTime(); //有人说话就更新时间
	var cb = "";
	for (let r of GlobalRuleList) {
		if (r.rule.test(msg)) {
			cb = await r.func(user, msg, key);
			break;
		}
	}
	if (cb) {
		if (isRedPacket) {
			return cb
		} else {
			return `@${user} :\n ${cb}`
		}
	}
}






let lastTime = new Date(); //最后一次说话时间
let lastTimes = 0; //持续次数
let lastTimeout = 5; //等待时间（单位：分钟）
let saohuaInterval = 0;

/**
 * 自动骚话，聊天室活跃砖家
 */
function autoSaohua() {
	if (conf.rob.enableSaohua) {
		let nowTime = new Date();
		if (nowTime - lastTime > lastTimeout * 60 * 1000) {
			if (nowTime.getHours() <= 18 && nowTime.getHours() >= 9) {
				if (lastTimes <= 5) {
					//连续说5次就不说了
					lastTimes++;
					sendMsg(getSaohua());
					lastTimeout += lastTimes * 5; //每次多等5分钟
				}
			} else lastTimes = 0; //重置连续次数
		}
	}
}
/**
 * 更新最后一次发消息的时间戳
 */
function updateLastTime() {
	lastTime = new Date();
	lastTimes = 0;
}

/**
 * 骚话系统设置
 * @param {boolean} isenable 是否启用骚话系统
 */
function ChangeSaohuaState(isenable = true) {
	if (isenable) {
		saohuaInterval = setInterval(() => {
			autoSaohua();
		}, 10 * 6 * 1000);
	} else {
		clearInterval(saohuaInterval);
		saohuaInterval = 0;
	}
}

/**
 * 更新获取摸鱼派(https://fishpi.cn/)的apiKey
 */
async function updateKey() {
	try {
		const res = await axios({
			method: 'POST',
			url: 'https://fishpi.cn/api/getKey',
			data: {
				nameOrEmail: conf.PWL.nameOrEmail,
				userPassword: conf.PWL.userPassword
			},
		});
		console.log('updateKey response', res.data);
		if (res.data.Key) {
			conf.PWL.apiKey = res.data.Key;
			writeConfig(conf, err => {
				if (err) throw err;
				console.log('配置更新完成');
			});
		} else throw 'apiKey错误，请检查用户名和密码（md5）';
	} catch (e) {
		console.log(e);
		throw 'apiKey未知错误';
	}
}

/**
 * 检测apiKey是否有效
 * @returns {boolean} 摸鱼派(https://fishpi.cn/)的apiKey是否有效
 */
async function checkKey() {
	if (conf.PWL.apiKey === '') return false;
	try {
		const resp = await axios({
			method: 'get',
			url: `https://fishpi.cn/api/user?apiKey=${conf.PWL.apiKey}`,
		});
		return resp.data.code === 0;
	} catch (e) {
		console.log('PWLapiKey更新错误，错误内容:', e);
		return false;
	}
}

/**
 * 获取小冰实时活跃度
 * @returns {boolean} 摸鱼派(https://fishpi.cn/)的小冰实时活跃度
 */
async function liveness() {
	if (conf.PWL.apiKey === '') return false;
	try {
		const resp = await axios({
			method: 'get',
			url: `https://fishpi.cn/user/liveness?apiKey=${conf.PWL.apiKey}`,
		});
		return resp.data.liveness;
	} catch (e) {
		console.log('PWL活跃债获取错误，错误内容:', e);
		return false;
	}
}

/**
 * 领取小冰昨日活跃奖励
 * @returns {boolean} 领取小冰昨日摸鱼派(https://fishpi.cn/)的活跃奖励
 */
async function salary() {
	if (conf.PWL.apiKey === '') return false;
	try {
		const resp = await axios({
			method: 'get',
			url: `https://fishpi.cn/activity/yesterday-liveness-reward-api?apiKey=${conf.PWL.apiKey}`,
		});
		return resp.data.sum;
	} catch (e) {
		console.log('PWL昨日活跃领取错误，错误内容:', e);
		return false;
	}
}

/**
 * 撤回消息
 * @returns {boolean} 领取小冰昨日摸鱼派(https://fishpi.cn/)的活跃奖励
 */
async function DeleteMsg(oId) {
	if (conf.PWL.apiKey === '') return false;
	try {
		const resp = await axios({
			method: 'DELETE',
			url: `https://fishpi.cn/chat-room/revoke/${oId}`,
			data: {
				apiKey: conf.PWL.apiKey
			}
		});
		return resp.data;
	} catch (e) {
		console.log('撤回消息失败:', e);
		return false;
	}
}

async function init() {
	axios.default.timeout = 5 * 1000;
	process.on('unhandledRejection', error => {
		console.log('我帮你处理了', error.message);
	});
	//全局5秒超时
	if (!(await checkKey())) {
		console.log('CK已过期');
		await updateKey();
	}
	ChangeSaohuaState();
	GetActivityInfo('鹊桥诗会');
}
module.exports = {
	sendMsg,
	init,
	liveness,
	salary,
	CallBackMsg
};