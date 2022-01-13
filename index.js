var express = require("express");
var app = express();
var router = express.Router();
var request = require('request');
const {
	init,
	CallBackMsg
} = require('./functions/chat');
// const { updateCookie } = require('./functions/other_apis');
//初始化WS
init();
// 每5分钟检测一次 已有新欢，旧爱拜拜
// updateCookie();
router.get('/GetImage', async function(req, res) {
	var url = req.query.url;
	url = decodeURI(url);
	url = Buffer.from(url, 'base64').toString();
	request({
		url: url,
		method: "GET",
		encoding: null,
		headers: {
			"Referer": "https://pwl.icu/"
		}
	}, function(error, response, body) {
		if (!error && response.statusCode === 200) {
			res.set('Content-Type', 'image/png;');
			res.send(body);
		} else {
			res.send(JSON.stringify(error) + ",response.statusCode:" + JSON.stringify(response) +
				",url:" + url);
		}
	});
});
router.get('/API', async function(req, res) {
	var msg = req.query.msg;
	var user = req.query.user;
	var key = req.query.key;
	if (!msg || !user || key != "xiaoIce") {
		res.send({
			code: 201,
			msg: "缺少参数"
		});
	} else {
		if (/^(小冰|小爱(同学)?|嘿?[，, ]?siri)/i.test(msg) && /(小姐姐视频)|([涩色]图)|(看妞|小姐姐|照片|来个妞)/.test(msg)) {
			var cb = await CallBackMsg(user, msg, "API")
			res.send({
				code: 200,
				msg: cb
			});
		} else {
			res.send({
				code: 202,
				msg: null
			});
		}
	}
})
app.use('/', router);
app.listen(3002, function() {
	console.log('YTNF-Server Start at:' + 3002);
});
