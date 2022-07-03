const query = require('./database/mysql');
const {
	sendMsg,
	getCDNLinks,
	formatTime
} = require('./utils');
const axios = require('axios');
const {
	configInfo: conf
} = require('./config');
const {
	responseLSP
} = require('./strings')
let lastSetuTime = 0;
/**
 * 获取排名
 * @param {string} user 用户名
 */
function GetXiaoIceGameRank(user) {
	return new Promise((resolve, reject) => {
		const levelFilter = ["黄阶低级", "黄阶中级", "黄阶高级", "玄阶低级", "玄阶中级", "玄阶高级", "地阶低级", "地阶中级", "地阶高级", "天阶低级", "天阶中级", "天阶高级"];
		query(
			`SELECT uname,lvfilter,exp,family FROM game_user_info WHERE uname != "Yui" AND uname != "xiaoIce" ORDER BY exp DESC LIMIT 0,5`,
			function (err, vals) {
				if (err) {
					resolve("等级排行榜查询失败！");
				} else {
					let msg = `等级排行榜 \n`;
					vals.forEach((item, index) => {
						item.family = JSON.parse(item.family);
						msg += `${index + 1}. ${item.uname}[${item.lvfilter}],当前经验：${item.exp}。血脉：${levelFilter[item.family.ancestry]}，功法：${levelFilter[item.family.gongfa]}。\n`
					})
					msg += "<a href='https://fishpi.cn/top/xiaoice' target='_blank'>完整榜单</a>"
					resolve(msg);
				}
			}
		);
	})
}

function GetXiaoIceGameRanking(type) {
	let byType = "gui.exp";
	if (type == 0) {
		byType = "gui.exp"
	} else if (type == 1) {
		byType = "gud.dieTimes"
	} else if (type == 2) {
		byType = "gud.allExTimes"
	} else if (type == 3) {
		byType = "gud.allBsTimes"
	}
	let sql = `SELECT gui.uname,gui.family,gui.exp,gui.lvfilter,gud.bsTimes,gud.exTimes,gud.allBsTimes,gud.allExTimes,gud.dieTimes FROM game_user_info AS gui,game_user_detail AS gud WHERE gui.uname = gud.uname AND gui.delete_flag = 0 ORDER BY ${byType} DESC LIMIT 0,64`
	return new Promise((resolve, reject) => {
		query(
			sql,
			function (err, vals) {
				if (err) {
					resolve("查询失败！");
				} else {
					resolve(vals);
				}
			}
		);
	})
}
/**
 * 检测倒计时
 * @param {string} user 用户名
 */
function checkSetuTime(user, key) {
	if (!key) {
		sendMsg(responseLSP(user));
		return false;
	}
	query(
		`SELECT * FROM setu_ranking WHERE userName = '${user}'`,
		function (err, vals) {
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
	// const nowTime = new Date();
	// if (
	// 	lastSetuTime != 0 &&
	// 	nowTime - lastSetuTime < conf.rob.lspWaitingTime * 60 * 1000
	// ) {
	// 	sendMsg(
	// 		`@${user} 你别这么猴急嘛！不是刚给你看过！\n再过【${formatTime(
	//                (conf.rob.lspWaitingTime * 60 * 1000 -
	//                    (nowTime - lastSetuTime)) /
	//                1000
	//            )}】，才能看下一张哦！ \n ![lsp](https://pwl.stackoverflow.wiki/2021/12/image-174932da.png)`
	// 	);
	// 	return false;
	// }
	// lastSetuTime = new Date();
	return true;
}
/**
 * 获取小姐姐图片
 * @param {string} user 用户名
 */
async function getXJJ(user, key) {
	try {
		if (!checkSetuTime(user, key)) return;
		const res = await axios({
			method: 'get',
			url: 'http://3650000.xyz/api/?type=img&mode=3&type=json',
			encoding: null,
		});
		const u = /^http/.test(res.data.url) ? res.data.url : `http://img.btu.pp.ua/random/${res.data.url}`;
		// const v = await getCDNLinks(u);
		let cb =
			`<p>小姐姐来了，小心旁边窥屏哦! </p><br> <img src="${u}" />`
		return cb;
	} catch (error) {
		return "不知道出了什么错误，小姐姐来不了! ";
	}
}
/**
 * 获取排名
 * @param {string} user 用户名
 */
function GetLSPRanking(user) {
	return new Promise((resolve, reject) => {
		query(
			`SELECT userName,setu_times FROM setu_ranking ORDER BY setu_times DESC LIMIT 0,10`,
			function (err, vals) {
				if (err) {
					resolve("lsp排行榜查询失败！");
				} else {
					let cb = `> LSP排行榜 \n`;
					vals.forEach((item, index) => {
						cb += `${index + 1}.  @${item.userName} 共计查询 ${item.setu_times
                            } 次 ${index == 0
                                ? '![lsp之王](https://unv-shield.librian.net/api/unv_shield?scale=0.79&txt=lsp%E4%B9%8B%E7%8E%8B&url=https://www.lingmx.com/52pj/images/die.png&backcolor=568289&fontcolor=ffffff)'
                                : ''
                            }\n`;
					});
					resolve(cb);
				}
			}
		);
	})
}
/**
 * 获取涩图消息
 * @param {string} user 用户名
 * @param {string} msg 消息
 */
async function getSetu(user, msg, key) {
	if (!checkSetuTime(user, key)) return;
	msg = msg.trim();
	try {
		const res = await axios({
			method: 'get',
			url: encodeURI(
				`https://api.lolicon.app/setu/v2?r18=${conf.rob.is18 ? 1 : 0
                }&size=small${msg.split(' ')[1] ? `&tag=${msg.split(' ')[1]}` : ''
                }`
			),
			headers: {
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36',
			},
		});
		if (res.data.data.length == 0) {
			let cb = "想啥呢，没有!";
			return cb;
		} else {
			const sta = await getCDNLinks(res.data.data[0].urls.small, true);
			let cb = `<p> 涩图来了!看不到的请不要看了</p>${res.data.data[0].urls.small === sta
                ? ''
                : `<br><p>链接有效期为【${formatTime(conf.api.max_age * 60)}】</p>`
                }<br><img src="${sta}" />`
			return cb;
		}
	} catch (error) {
		return "已读，不回!"
	}
}

module.exports = {
	getXJJ,
	GetLSPRanking,
	getSetu,
	GetXiaoIceGameRank,
	GetXiaoIceGameRanking
};