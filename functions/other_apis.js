const axios = require('axios');
const query = require('./database/mysql');
const {
	configInfo: conf
} = require('./config');
const {
	xiaoBingEncode
} = require('./utils');
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
	const {
		sendMsg
	} = require('./chat');
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
			`@${user} :\n >滴~ 你点的歌来了 \n\n<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="//music.163.com/outchain/player?type=2&id=${mid}&auto=0&height=66"></iframe>`
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
			cb =
				`<br><audio controls> <source src="${res.data[0].Content.AudioUrl}" type="audio/mpeg"></audio><hr><p>以下是语音转文字: <br>${res.data[0].Content.Text}</p>`;
		} else {
			cb = res.data[0].Content.Text;
		}
		return cb;
	} catch (error) {
		console.log('不知道什么问题', error);
		return '小冰的cookie过期了呢~\n菜鸡两个开发还不知道怎么自动更新cookie';
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
/**
 * 获取天气及笑话
 * @param {string} user 用户名
 * @param {string} msg 消息
 */
function getXiaohuaAndTianqi(user, msg) {
	const {
		sendMsg
	} = require('./chat');
	let dateReg = /(明天|后天|大后天)*天气$/
	let date = msg.match(dateReg)[1];
	let adr = "";
	if (date) {
		adr = msg.substr(0, msg.indexOf(date))
	} else {
		adr = msg.substr(0, msg.indexOf("天气"))
	}
	if (!adr) {
		sendMsg(`@${user} : 你查询了一个寂寞~ \n 天气指令：小冰 地点[时间]天气`);
		return;
	}
	console.log(JSON.stringify({
		addr: adr.split("").join("%"),
		date: date
	}))
	query(
		`SELECT * FROM adcode WHERE addr LIKE '%${adr.split("").join("%")}%'`,
		async function(err, vals) {
			if (err) {
				console.log('checkSetuTime出错:', err);
			} else {
				if (vals.length == 0) {
					sendMsg(`@${user} : 未查询到地点：${adr}`);
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
							let cb = `\n ${adr}:${weatherData.forecast_keypoint}`;
							let msg = "\n 天气信息： \n";
							if (date == "明天") {
								let ndate = new Date(weather[1].date);
								let m = ndate.getMonth()+1;
								let d = ndate.getDate();
							let url = `https://www.lingmx.com/card/index.html?m=${m}&d=${d}&w=${weatherCode[1].value}&a=${Math.ceil(weather[1].avg)}`
								msg +=`<iframe src="${url}" width="250" height="320" frameborder="0"></iframe> \n`
							} else if (date == "后天") {
							let ndate = new Date(weather[2].date);
								let m = ndate.getMonth()+1;
								let d = ndate.getDate();
							let url = `https://www.lingmx.com/card/index.html?m=${m}&d=${d}&w=${weatherCode[2].value}&a=${Math.ceil(weather[2].avg)}`
								msg +=`<iframe src="${url}" width="250" height="320" frameborder="0"></iframe> \n`
							} else if (date == "大后天") {
							let ndate = new Date(weather[3].date);
								let m = ndate.getMonth()+1;
								let d = ndate.getDate();
							let url = `https://www.lingmx.com/card/index.html?m=${m}&d=${d}&w=${weatherCode[3].value}&a=${Math.ceil(weather[3].avg)}`
								msg +=`<iframe src="${url}" width="250" height="320" frameborder="0"></iframe> \n`
							} else {
							    let date = [];
							    let weatherCodeList = [];
							    let max = [];
							    let min = [];
							    for(let i = 0; i < 5; i++){
									
							        let ndate = new Date(weather[i].date);
							        let m = ndate.getMonth()+1;
								    let d = ndate.getDate();
								    date.push(`${m}/${d}`);
								    weatherCodeList.push(weatherCode[i].value);
								    max.push(weather[i].max)
								    min.push(weather[i].min)
							    }
							    let url = `https://www.lingmx.com/card/index2.html?date=${date.join(",")}&weatherCode=${weatherCodeList.join(",")}&max=${max.join(",")}&min=${min.join(",")}`
							    msg +=`<iframe src="${url}" width="380" height="310" frameborder="0"></iframe> \n`;
							}
							if (alertInfo.length > 0) {
								msg += "\n --- \n"
								msg += "预警信息： \n"
								alertInfo.forEach(items => {
									msg += `${items.title} \n ${items.description}`
								})
							}
							sendMsg(`@${user} : \n ${cb} \n ${msg}`);
						} catch (e) {
							console.log("查询天气异常：" + JSON.stringify(e))
							sendMsg(`@${user} : 小冰的天气接口出错了哦~`);
						}
					} else {
						sendMsg(`@${user} : 小冰的天气接口出错了哦~`);
					}
				}
			}
		}
	);
	// let message = encodeURI(msg);
	// const res = await axios({
	//     method: 'get',
	//     url: 'http://api.qingyunke.com/api.php?key=free&appid=0&msg=' + message,
	// });
	// let cb = res.data.content;
	// cb = cb.replace(/{br}/g, '<br>');
	// cb = cb.replace(/菲菲/g, '小冰');
	// sendMsg(`@${user} :` + cb);
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
		console.log(res.data);
		cb = res.data.content;
		return cb;
	} catch (error) {
		console.log('不知道什么问题', error);
		return '新小冰的接口似乎出问题了？不是很懂=_=';
	}
}
module.exports = {
	updateCookie,
	wyydiange,
	getChatData,
	getXiaohuaAndTianqi,
	chatWithXiaoBingByBing,
};
