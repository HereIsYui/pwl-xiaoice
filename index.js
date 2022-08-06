var express = require("express");
var app = express();
var router = express.Router();
var request = require('request');
const {
	init,
	CallBackMsg
} = require('./functions/chat');
const {
	sendMsg
} = require('./functions/utils');
const {
	GetXiaoIceGameRanking
} = require('./functions/lsp');
const {
	GetActivityAllInfo
} = require('./functions/other_apis')

//初始化WS
init();
// 每5分钟检测一次 已有新欢，旧爱拜拜

router.get('/GetImage', async function (req, res) {
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
	}, function (error, response, body) {
		if (!error && response.statusCode === 200) {
			res.set('Content-Type', 'image/png;');
			res.send(body);
		} else {
			res.send(JSON.stringify(error) + ",response.statusCode:" + JSON.stringify(response) +
				",url:" + url);
		}
	});
});
router.get('/API', async function (req, res) {
	var msg = req.query.msg;
	var user = req.query.user;
	var key = req.query.key;
	if (!msg || !user || key != "xiaoIce") {
		res.send({
			code: 201,
			msg: "缺少参数"
		});
	} else {
		if (/^(小冰|小爱(同学)?|嘿?[，, ]?siri)/i.test(msg)) {
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
router.get('/SendMsg', async function (req, res) {
	var msg = decodeURI(req.query.msg);
	var key = req.query.key;
	if (!msg || key != "xiaoIceGame") {
		res.send({
			code: 201,
			msg: "缺少参数"
		});
	} else {
		sendMsg(msg)
		res.send({
			code: 200,
			msg: "ok"
		})
	}
})

router.get('/GetXiaoIceGameRank', async function (req, res) {
	var type = req.query.type;
	var key = req.query.key;
	if (key != "xiaoIceGame") {
		res.send({
			code: 201,
			msg: "缺少参数"
		});
	} else {
		let cb = await GetXiaoIceGameRanking(type)
		res.send({
			code: 200,
			msg: "ok",
			data: cb
		})
	}
})

router.get('/GetActiveRanking', async function (req, res) {
	var key = req.query.key;
	var tag = req.query.tag;
	if (key != "xiaoIceGame") {
		res.send({
			code: 201,
			msg: "缺少参数"
		});
	} else {
		let cb = await GetActivityAllInfo(tag)
		res.send({
			code: 200,
			msg: "ok",
			data: cb
		})
	}
})


app.all('*', function (req, res, next) {
	//设为指定的域
	res.header('Access-Control-Allow-Origin', "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
	res.header('Access-Control-Allow-Credentials', true);
	res.header("X-Powered-By", ' 3.2.1');
	next();
});

app.use('/', router);
app.listen(3002, function () {
	console.log('YTNF-Server Start at:' + 3002);
});