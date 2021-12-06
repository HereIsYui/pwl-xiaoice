/**
 * 数组里随机抽取一条
 * @param {Array} arr 字符串列表
 * @returns 数组种的随机一条
 */
function getRandomFromArray(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
/**
 * 随机返回骚话
 */
function randomSaoHua() {
    return getRandomFromArray([
        '人呢？',
        '喂？',
        '歪歪歪？？',
        '理一下我嘛。。',
        '咦，人去哪儿了？',
        '很无聊呀',
        '(孤芳自赏)',
        '（自娱自乐ing）',
        '机器人不要面子的吗',
        '我摸鱼去了，不要打扰我',
        '好冷清啊',
        '。。。'
    ]);
}
/**
 * 随机返回空白艾特返回语
 * @param {string} user 用户名
 */
function randomEmptyCall(user) {
    return getRandomFromArray([
        `@${user} 艾特我干啥?`,
        `@${user} \n只艾特，也不说话，你是不是有病?`,
        `@${user} 你怕不是有那个大病`,
        `@${user} 啥事？`,
        `@${user} 我在`,
        `@${user} ？？？`,
        `@${user} 。。。`,
        `@${user} （礼尚往来）`,
    ]);
}
/**
 * 随机返回状态
 */
function randomResponse() {
    return getRandomFromArray([
        'emmm我说关闭你信吗？',
        '肯定是打开啦，不然怎么响应的。。',
        '（未响应）',
        '（蓝屏了）',
        '100 Continue',
        '101 Switching Protocols',
        '103 Early Hints',
        '200 Error',
        '201 Created',
        '202 Accepted',
        '203 Non-Authoritative Information',
        '204 No Content',
        '205 Reset Content',
        '206 Partial Content',
        '300 Multiple Choices',
        '301 Moved Permanently',
        '302 Found',
        '303 See Other',
        '304 Not Modified',
        '307 Temporary Redirect',
        '308 Permanent Redirect',
        '400 Bad Request',
        '401 Unauthorized',
        '402 Payment Required',
        '403 Forbidden',
        '404 Not Found',
        '405 Method Not Allowed',
        '406 Not Acceptable',
        '407 Proxy Authentication Required',
        '408 Request Timeout',
        '409 Conflict',
        '410 Gone',
        '411 Length Required',
        '412 Precondition Failed',
        '413 Payload Too Large',
        '414 URI Too Long',
        '415 Unsupported Media Type',
        '416 Range Not Satisfiable',
        '417 Expectation Failed',
        "418 I'm a teapot",
        '422 Unprocessable Entity',
        '425 Too Early',
        '426 Upgrade Required',
        '428 Precondition Required',
        '429 Too Many Requests',
        '431 Request Header Fields Too Large',
        '451 Unavailable For Legal Reasons',
        '500 Internal Server Error',
        '501 Not Implemented',
        '502 Bad Gateway',
        '503 Service Unavailable',
        '504 Gateway Timeout',
        '505 HTTP Version Not Supported',
        '506 Variant Also Negotiates',
        '507 Insufficient Storage',
        '508 Loop Detected',
        '510 Not Extended',
        '511 Network Authentication Required',
    ]);
}
module.exports = {
    getSaohua: randomSaoHua,
    getResponse: randomResponse,
    EmptyCall: randomEmptyCall,
};
