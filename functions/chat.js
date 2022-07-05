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
	wyydiange,
	getXiaohuaAndTianqi,
	chatWithXiaoBingByBing,
} = require('./other_apis');
const {
	getXJJ,
	GetLSPRanking,
	GetXiaoIceGameRank,
	getSetu
} = require('./lsp');
const {
	changeSaoHua,
	changeR18,
	setAdmin,
} = require('./settings');
const {
	sendMsg
} = require('./utils');

var oIdList = [];
var client = new WebSocketClient();
client.on('connectFailed', function (error) {
	console.log('Connect Error: ' + error.toString());
});
client.on('connect', function (connection) {
	console.log('嘀~你的小冰已上线!');
	setInterval(() => {
		socketClient.send("-hb-")
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
client.connect(`wss://fishpi.cn/chat-room-channel?apiKey=${conf.PWL.apiKey}`);

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

const GlobalRuleList = [{
	rule: /^点歌/,
	func: async (user, msg) => {
		let cb = await wyydiange(user, msg);
		return cb;
	}
}, {
	rule: /^(添加管理|删除管理)/,
	func: async (user, msg) => {
		let cb = await setAdmin(user, msg);
		return cb;
	}
}, {
	rule: /^TTS|^朗读/i,
	func: async (user, msg) => {
		const link =
			Buffer.from(
				'aHR0cHM6Ly9kaWN0LnlvdWRhby5jb20vZGljdHZvaWNlP2xlPXpoJmF1ZGlvPQ==',
				'base64'
			) + encodeURIComponent(msg.replace(/^TTS|^朗读/i, '')),
			cb = `那你可就听好了<br><audio src='${link}' controls/>`
		return cb
	}
}, {
	rule: /^小冰/,
	func: async (user, msg, key) => {
		let cb = await GetXiaoIceMsg(user, msg, key);
		return cb;
	}
}]


async function GetXiaoIceMsg(user, msg, key) {
	console.log('叮~你的小冰被唤醒了');
	// 更新上次讲话时间
	let message = msg.replace(/^(小冰|小爱(同学)?|嘿?[，, ]?siri)/i, '');
	if (/并说/.test(message)) {
		message = message.split(':');
		message = message[message.length - 1];
	}
	message = message.trim();
	let cb = "";
	for (let r of XiaoIceRuleList) {
		if (r.rule.test(message)) {
			console.log(`收到${user}的指令：${message}`)
			cb = await r.func(user, message, key);
			break;
		}
	}
	return cb;

}

const XiaoIceRuleList = [{
	rule: /^\s*$/,
	func: async (user, message) => {
		let cb = "";
		if (Math.random() > 0.2) {
			cb = EmptyCall(user)
		}
		return cb;
	}
}, {
	rule: /^(别逼逼?了|闭嘴|人呢|在哪儿?呢?)$/,
	func: async (user, message) => {
		let cb = await changeSaoHua(user);
		return cb;
	}
}, {
	rule: /看妞|小姐姐|照片|来个妞/,
	func: async (user, message, key) => {
		let cb = await getXJJ(user, key);
		return cb
	}
}, {
	rule: /[涩色]图/,
	func: async (user, message, key) => {
		let cb = await getSetu(user, message, key);
		return cb;
	}
}, {
	rule: /^((打开|关闭)r18)$/,
	func: async (user, message) => {
		let cb = await changeR18(user, message);
		return cb;
	}
}, {
	rule: /^(菜单|功能)(列表)?$/,
	func: async (user, message) => {
		let cb = `功能列表:\n1. 回复[看妞][小姐姐][来个妞]等查看妹子图片 [接口维护中]❌\n2. 回复[涩图]可查看涩图(可在涩图后跟标签查找对应的标签图片 如: 涩图 原神) [接口维护中]❌\n(当前插图模式:${conf.rob.is18 ? 'lsp模式' : '绅士模式'} 可输入[打开/关闭r18]切换)\n3. 全局发送[TTS+文本]或[朗读+文本]即可朗读(无需关键词)\n	4. 直接发短语即可聊天。\n5. 回复[xxx天气]可以查询天气\n6. 回复[笑话]可以随机讲个笑话\n7. 输入[lsp排行]可查看聊天室的lsp排行`;
		return cb;
	}
}, {
	rule: /^lsp排行(榜?)$/,
	func: async (user, message) => {
		let cb = await GetLSPRanking(user);
		return cb;
	}
}, {
	rule: /\w*天气/,
	func: async (user, message) => {
		let cb = await getXiaohuaAndTianqi(user, message)
		return cb;
	}
}, {
	rule: /(当前|现在|今日|水多)(吗|少了)?(活跃)?值?$/,
	func: async (user, message) => {
		let cb = "";
		if (conf.admin.includes(user)) {
			let msg = await liveness()
			cb = `小冰当前活跃值为：${msg}`;
		} else {
			cb = `小冰不知道你的活跃哦~`
		}
		return cb;
	}
}, {
	rule: /(去打劫|发工资)了?吗?$/,
	func: async (user, message) => {
		let cb = "";
		if (conf.admin.includes(user)) {
			let msg = await salary()
			let isDajie = !message.match('工资');
			cb = `小冰${isDajie ? '打劫回来' : '发工资'}啦！一共获得了${msg >= 0 ? msg + '点积分~' : '0点积分，不要太贪心哦~'}`;
		} else {
			cb = `本是要去的，但是转念一想，尚有这么多事情要做，便也就放弃了罢`;
		}
		return cb;
	}
}, {
	rule: /(发个|来个)红包$/,
	func: async (user, message) => {
		let cb = "";
		if (conf.admin.includes(user)) {
			// 概率暂时设置成5%吧，以后在改成次数限制
			if (Math.random() > 0.95) {
				let data = {
					msg: "最！后！一！个！别再剥削我了！！！！",
					money: 300,
					count: 5
				};
				isRedPacket = true;
				cb = `[redpacket]${JSON.stringify(data)}[/redpacket]`;
			} else {
				cb = `不给了！不给了！光找我要红包，你倒是给我一个啊！本来工资就不高，还天天剥削我！！！`
			}
		} else {
			cb = `这件事已不必再提，皆因钱财不够`
		}
		return cb;
	}
}, {
	rule: /^等级排行(榜?)$/,
	func: async (user, message) => {
		let cb = await GetXiaoIceGameRank();
		return cb;
	}
}, {
	rule: /撤回\d*$/,
	func: async (user, message) => {
		let cb = "";
		if (conf.admin.includes(user)) {
			let num = message.substr(message.indexOf('撤回') + 2).trim();
			try {
				num = parseInt(num);
				let deleteList = oIdList.splice(0, num);
				deleteList.forEach(async function (oId) {
					DeleteMsg(oId)
				})
				cb = `撤回完成，共计撤回${num}条消息。`;
			} catch (e) {
				cb = `撤回失败，请检查日志。`;
			}
		} else {
			cb = `暂无权限~`;
		}
		return cb;
	}
}, {
	rule: /(今天|明天|后天|早上|中午|晚上).{0,4}吃(啥|什么)/,
	func: async (user, message) => {
		let foodList = ['馄饨', '拉面', '烩面', '热干面', '刀削面', '油泼面', '炸酱面', '炒面', '重庆小面', '米线', '酸辣粉', '土豆粉', '螺狮粉', '凉皮儿', '麻辣烫', '肉夹馍', '羊肉汤', '炒饭', '盖浇饭', '卤肉饭', '烤肉饭', '黄焖鸡米饭', '驴肉火烧', '川菜', '麻辣香锅', '火锅', '酸菜鱼', '烤串', '西北风', '披萨', '烤鸭', '汉堡', '炸鸡', '寿司', '蟹黄包', '煎饼果子', '生煎', '炒年糕'];
		let food = Math.floor(Math.random() * foodList.length);
		let cb = `不知道吃啥那就吃 [${foodList[food]}] 吧`
		return cb;
	}
}, {
	rule: /.*/,
	func: async (user, message) => {
		let cb = await chatWithXiaoBingByBing(message);
		return cb;
	}
}]



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
	//全局5秒超时
	if (!(await checkKey())) {
		console.log('CK已过期');
		await updateKey();
	}
	ChangeSaohuaState();
}
module.exports = {
	sendMsg,
	init,
	liveness,
	salary,
	CallBackMsg
};