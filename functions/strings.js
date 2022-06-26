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
        `艾特我干啥?`,
        `只艾特，也不说话，你是不是想我了又不敢讲?`,
        `来了老弟`,
        `啥事？`,
        `我在`,
        `？？？`,
        `。。。`,
        `（礼尚往来）`,
    ]);
}

/**
 * 随机返回老涩批返回语
 * @param {string} user 用户名
 */
function randomRespomseLSP(user) {
    return getRandomFromArray([
        `@${user} :干啥啥不行，当lsp第一名`,
        `@${user} :就不给，略略略`,
        `@${user} :针好康（沉迷其中）`,
        `@${user} :小姐姐离你而去了，lsp歇歇吧！`,
        `@${user} :\n![小姐姐](https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fws4.sinaimg.cn%2Flarge%2F9150e4e5ly1fuhpptlufpg208c08cgln.gif&refer=http%3A%2F%2Fws4.sinaimg.cn&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1641801508&t=ae796a5435c6a5efa66b7c5a1399e306)`,
        `@${user} :\n![小姐姐](https://pwl.stackoverflow.wiki/2021/12/image174932da-bb9fbb0f.png)`,
    ]);
}
module.exports = {
    getSaohua: randomSaoHua,
    EmptyCall: randomEmptyCall,
    responseLSP: randomRespomseLSP
};