const { init } = require('./functions/chat');
// const { updateCookie } = require('./functions/other_apis');
//初始化WS
init();
// 每5分钟检测一次 已有新欢，旧爱拜拜
// updateCookie();