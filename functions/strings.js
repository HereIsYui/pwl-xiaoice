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
        `@${user} 只艾特，也不说话，你是不是想我了又不敢讲?`,
        `@${user} 来了老弟`,
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

/**
 * 随机返回老涩批返回语
 * @param {string} user 用户名
 */
function randomRespomseLSP(user) {
    return getRandomFromArray([
        `@${user} 干啥啥不行，当lsp第一名`,
        `@${user} 不给\n![小姐姐](https://img1.baidu.com/it/u=4171135686,29251773&fm=26&fmt=auto)`,
        `@${user} 就不给，略略略`,
        `@${user} 针好康（沉迷其中）`,
        `@${user} :小姐姐离你而去了，lsp歇歇吧！`,
        `@${user} \n ![小姐姐](https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fws4.sinaimg.cn%2Flarge%2F9150e4e5ly1fuhpptlufpg208c08cgln.gif&refer=http%3A%2F%2Fws4.sinaimg.cn&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1641801508&t=ae796a5435c6a5efa66b7c5a1399e306)`,
        `@${user} \n ![小姐姐](https://img2.baidu.com/it/u=3589572707,540934736&fm=26&fmt=auto)`,
        `@${user} \n ![小姐姐](https://img0.baidu.com/it/u=4052020447,1499918617&fm=26&fmt=auto)`,
        `@${user} \n ![小姐姐](https://img2.baidu.com/it/u=1745399900,1294386194&fm=253&fmt=auto&app=138&f=JPEG?w=192&h=192)`,
        `@${user} \n ![小姐姐](https://pwl.stackoverflow.wiki/2021/12/image174932da-bb9fbb0f.png)`,
    ]);
}
module.exports = {
    getSaohua: randomSaoHua,
    getResponse: randomResponse,
    EmptyCall: randomEmptyCall,
    responseLSP: randomRespomseLSP
};