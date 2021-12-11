const { configInfo: conf } = require('./config');
const axios = require('axios');

/**
 * 日期、时间格式化
 * @param {Date} time 需要转换的时间
 * @param {string} str 返回的格式，$[YMdhms]作为分割
 * @returns 格式化后的时间差
 */
function cnFmt(time, str) {
    return str
        .replace(/y/i, time.getFullYear() - 1970)
        .replace(/M/i, time.getMonth())
        .replace(/d/i, time.getDate() - 1)
        .replace(/h/i, time.getHours())
        .replace(/m/i, time.getMinutes())
        .replace(/s/i, time.getSeconds())
        .replace(/\$\[0+[^\]]+\]|\$\[|\]/g, '');
}
/**
 * 秒数转时间（字符串）
 * @param {number} time 需要转换的时间，单位：秒
 * @returns 中文形式剩余时间
 */
function formatTime(time) {
    return cnFmt(
        new Date(time * 1000 - 28800000),
        '$[Y年]$[M月]$[D天]$[h小时]$[m分钟]$[S秒]'
    );
}
/**
 * 链接套上CDN加速
 * @param {url} url 需要转换的链接
 * @param {Boolean} isForce 是否强制CDN，即如果超过限制就使用第三方接口
 * @returns CDN后的链接,如果CDN处理错误，返回原链接，@param isForce 为真时返回第三方接口
 *
 * (其实就是故意限制时长)
 */
async function getCDNLinks(url, isForce = false) {
    try {
        const axios = require('axios');
        const resp = await axios({
            method: 'post',
            url: 'https://proxy.taozhiyu.workers.dev/request/',
            data: JSON.stringify({
                method: 'GET',
                url,
                token: conf.api.token,
                max_age: conf.api.max_age, //默认14400，有效期4小时
            }),
        });
        if (resp.status === 200) {
            return `https://proxy.taozhiyu.workers.dev/request/${resp.data.key}`;
        }
        console.log('CDN状态错误');
        return isForce ? `https://proxy.onesrc.workers.dev/?url=${url}` : url;
    } catch (e) {
        console.log('CDN获取失败');
        return isForce ? `https://proxy.onesrc.workers.dev/?url=${url}` : url;
    }
}
/**
 * 别问，问就是从微软代码里扒出来的，看起来又像aes又不像，应该是魔改的
 * @param {string} word 要说的话
 * @returns 返回加密后的数据
 */
function xiaoBingEncode(word) {
    let a;
    !(function (r) {
        function o(r, o) {
            for (
                var n, u, c = o.length / 4 - 1, i = [[], [], [], []], h = 0;
                h < 16;
                h++
            )
                i[h % 4][Math.floor(h / 4)] = r[h];
            for (i = a(i, o, 0, 4), n = 1; n < c; n++)
                i = a((i = t((i = f((i = e(i, 4)), 4)))), o, n, 4);
            for (
                i = a((i = f((i = e(i, 4)), 4)), o, c, 4),
                    u = new Array(16),
                    h = 0;
                h < 16;
                h++
            )
                u[h] = i[h % 4][Math.floor(h / 4)];
            return u;
        }
        function n(r) {
            for (
                var o,
                    n,
                    e = r.length / 4,
                    f = e + 6,
                    t = new Array(4 * (f + 1)),
                    a = new Array(4),
                    i = 0;
                i < e;
                i++
            )
                (o = [r[4 * i], r[4 * i + 1], r[4 * i + 2], r[4 * i + 3]]),
                    (t[i] = o);
            for (i = e; i < 4 * (f + 1); i++) {
                for (t[i] = new Array(4), n = 0; n < 4; n++) a[n] = t[i - 1][n];
                if (i % e == 0)
                    for (a = u(c(a)), n = 0; n < 4; n++) a[n] ^= A[i / e][n];
                else e > 6 && i % e == 4 && (a = u(a));
                for (n = 0; n < 4; n++) t[i][n] = t[i - e][n] ^ a[n];
            }
            return t;
        }
        function e(r, o) {
            for (var n, e = 0; e < 4; e++)
                for (n = 0; n < o; n++) r[e][n] = h[r[e][n]];
            return r;
        }
        function f(r, o) {
            for (var n, e = new Array(4), f = 1; f < 4; f++) {
                for (n = 0; n < 4; n++) e[n] = r[f][(n + f) % o];
                for (n = 0; n < 4; n++) r[f][n] = e[n];
            }
            return r;
        }
        function t(r) {
            for (var o, n, e, f = 0; f < 4; f++) {
                for (o = new Array(4), n = new Array(4), e = 0; e < 4; e++)
                    (o[e] = r[e][f]),
                        (n[e] =
                            128 & r[e][f]
                                ? (r[e][f] << 1) ^ 283
                                : r[e][f] << 1);
                (r[0][f] = n[0] ^ o[1] ^ n[1] ^ o[2] ^ o[3]),
                    (r[1][f] = o[0] ^ n[1] ^ o[2] ^ n[2] ^ o[3]),
                    (r[2][f] = o[0] ^ o[1] ^ n[2] ^ o[3] ^ n[3]),
                    (r[3][f] = o[0] ^ n[0] ^ o[1] ^ o[2] ^ n[3]);
            }
            return r;
        }
        function a(r, o, n, e) {
            for (var f, t = 0; t < 4; t++)
                for (f = 0; f < e; f++) r[t][f] ^= o[4 * n + f][t];
            return r;
        }
        function u(r) {
            for (var o = 0; o < 4; o++) r[o] = h[r[o]];
            return r;
        }
        function c(r) {
            for (var o = r[0], n = 0; n < 3; n++) r[n] = r[n + 1];
            return (r[3] = o), r;
        }
        function i(r) {
            return r
                .replace(/[\u0080-\u07ff]/g, function (r) {
                    var o = r.charCodeAt(0);
                    return String.fromCharCode(192 | (o >> 6), 128 | (63 & o));
                })
                .replace(/[\u0800-\uffff]/g, function (r) {
                    var o = r.charCodeAt(0);
                    return String.fromCharCode(
                        224 | (o >> 12),
                        128 | ((o >> 6) & 63),
                        128 | (63 & o)
                    );
                });
        }
        var h = [
                99, 124, 119, 123, 242, 107, 111, 197, 48, 1, 103, 43, 254, 215,
                171, 118, 202, 130, 201, 125, 250, 89, 71, 240, 173, 212, 162,
                175, 156, 164, 114, 192, 183, 253, 147, 38, 54, 63, 247, 204,
                52, 165, 229, 241, 113, 216, 49, 21, 4, 199, 35, 195, 24, 150,
                5, 154, 7, 18, 128, 226, 235, 39, 178, 117, 9, 131, 44, 26, 27,
                110, 90, 160, 82, 59, 214, 179, 41, 227, 47, 132, 83, 209, 0,
                237, 32, 252, 177, 91, 106, 203, 190, 57, 74, 76, 88, 207, 208,
                239, 170, 251, 67, 77, 51, 133, 69, 249, 2, 127, 80, 60, 159,
                168, 81, 163, 64, 143, 146, 157, 56, 245, 188, 182, 218, 33, 16,
                255, 243, 210, 205, 12, 19, 236, 95, 151, 68, 23, 196, 167, 126,
                61, 100, 93, 25, 115, 96, 129, 79, 220, 34, 42, 144, 136, 70,
                238, 184, 20, 222, 94, 11, 219, 224, 50, 58, 10, 73, 6, 36, 92,
                194, 211, 172, 98, 145, 149, 228, 121, 231, 200, 55, 109, 141,
                213, 78, 169, 108, 86, 244, 234, 101, 122, 174, 8, 186, 120, 37,
                46, 28, 166, 180, 198, 232, 221, 116, 31, 75, 189, 139, 138,
                112, 62, 181, 102, 72, 3, 246, 14, 97, 53, 87, 185, 134, 193,
                29, 158, 225, 248, 152, 17, 105, 217, 142, 148, 155, 30, 135,
                233, 206, 85, 40, 223, 140, 161, 137, 13, 191, 230, 66, 104, 65,
                153, 45, 15, 176, 84, 187, 22,
            ],
            A = [
                [0, 0, 0, 0],
                [1, 0, 0, 0],
                [2, 0, 0, 0],
                [4, 0, 0, 0],
                [8, 0, 0, 0],
                [16, 0, 0, 0],
                [32, 0, 0, 0],
                [64, 0, 0, 0],
                [128, 0, 0, 0],
                [27, 0, 0, 0],
                [54, 0, 0, 0],
            ];
        r.e = function (r, e, f) {
            var t, a, u, c, h, A, v;
            if (128 != f && 192 != f && 256 != f) return '';
            for (
                r = i(r), e = i(e), t = f / 8, a = new Array(t), v = 0;
                v < t;
                v++
            )
                a[v] = isNaN(e.charCodeAt(v)) ? 0 : e.charCodeAt(v);
            u = (u = o(a, n(a))).concat(u.slice(0, t - 16));
            var C = new Array(16),
                l = new Date().getTime(),
                d = l % 1e3,
                g = Math.floor(l / 1e3),
                w = Math.floor(65535 * Math.random());
            for (v = 0; v < 2; v++) C[v] = (d >>> (8 * v)) & 255;
            for (v = 0; v < 2; v++) C[v + 2] = (w >>> (8 * v)) & 255;
            for (v = 0; v < 4; v++) C[v + 4] = (g >>> (8 * v)) & 255;
            for (c = '', v = 0; v < 8; v++) c += String.fromCharCode(C[v]);
            var y = n(u),
                m = Math.ceil(r.length / 16),
                s = new Array(m);
            for (h = 0; h < m; h++) {
                for (A = 0; A < 4; A++) C[15 - A] = (h >>> (8 * A)) & 255;
                for (A = 0; A < 4; A++)
                    C[11 - A] = (h / 4294967296) >>> (8 * A);
                var M = o(C, y),
                    S = h < m - 1 ? 16 : ((r.length - 1) % 16) + 1,
                    j = new Array(S);
                for (v = 0; v < S; v++)
                    (j[v] = M[v] ^ r.charCodeAt(16 * h + v)),
                        (j[v] = String.fromCharCode(j[v]));
                s[h] = j.join('');
            }
            return (function (r) {
                for (
                    var o = '0x',
                        n = [
                            '0',
                            '1',
                            '2',
                            '3',
                            '4',
                            '5',
                            '6',
                            '7',
                            '8',
                            '9',
                            'a',
                            'b',
                            'c',
                            'd',
                            'e',
                            'f',
                        ],
                        e = 0;
                    e < r.length;
                    e++
                )
                    o += n[r.charCodeAt(e) >> 4] + n[15 & r.charCodeAt(e)];
                return o;
            })(c + s.join(''));
        };
    })(a || (a = {}));
    return a.e(word, '3d9d5f16-5df0-43d7-902e-19274eecdc41', 256);
}

module.exports = { formatTime, getCDNLinks, xiaoBingEncode};
