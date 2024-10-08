import { configInfo as conf, writeConfig } from "../config";
import axios from "axios";
import { LOGGER } from "../logger";
import { Like } from "typeorm";

export const music163 = async function ({ msg }: { msg: string }) {
  msg = encodeURI(msg.replace(/^点歌/, "").trim());
  try {
    const res = await axios({
      method: "POST",
      headers: {
        Host: "music.163.com",
        Origin: "http://music.163.com",
        "user-agent": "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded",
        referer: "http://music.163.com/search/",
      },
      url: `http://music.163.com/api/search/get/web?csrf_token&hlpretag&hlposttag&s=${msg}&type=1&offset=0&total=true&limit=1`,
    });
    let mid = res.data.result.songs[0].id;
    let cb = `>滴~ 你点的歌来了 \n\n<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="//music.163.com/outchain/player?type=2&id=${mid}&auto=0&height=66"></iframe>`;
    return cb;
  } catch (error) {
    LOGGER.Err(JSON.stringify(error), 0);
    return "你丫的这首歌太难找了!换一个!";
  }
};

export const setAdmin = async function (user: string, message: string) {
  return await new Promise((resolve, reject) => {
    if (conf.admin.includes(user)) {
      const isAdd = !message.match("删除");
      const uname = message.substring(4).trim();
      const index = conf.admin.indexOf(uname);
      if (isAdd) {
        if (index >= 0) {
          resolve(`${uname}已经是管理了！别加了！当前管理员: ${conf.admin}`);
        } else {
          conf.admin.push(uname);
        }
      } else {
        if (["Yui", "taozhiyu"].includes(uname)) {
          resolve(`超管不可删除！当前管理员: ${conf.admin}`);
        } else if (index >= 0) {
          conf.admin.splice(index, 1);
        } else {
          resolve(`${uname}不是管理了！不用删除！当前管理员: ${conf.admin}`);
        }
      }
      writeConfig(conf, (err) => {
        if (err) {
          resolve(`修改出错! 请查看日志，机器人已停止运行\n 当前当前管理员: ${conf.admin}(机器人都停止运行了,这个还有什么意义吗喂?)`);
        } else {
          resolve(`修改成功，当前管理员: ${conf.admin}`);
        }
      });
    } else {
      resolve(`暂无权限，当前管理员: ${conf.admin}`);
    }
  });
};

export const EmptyCall = function (user: string) {
  return getRandomFromArray([
    "艾特我干啥?",
    "只艾特，也不说话，你是不是想我了又不敢讲?",
    "来了老弟",
    "啥事？",
    "我在",
    "???",
    "。。。",
    "（礼尚往来）",
  ]);
};

export const GetXiaoIceGameRank = async function () {
  try {
    const res = await axios({
      method: "get",
      url: `https://pwl.yuis.cc/GetRank`,
    });
    return res.data.data;
  } catch (error) {
    return "功能调整中";
  }
};

export const getActivutyRanking = function (tag: string) {
  return "功能调整中";
};

export const chatWithXiaoBing = async function (msg: string) {
  try {
    const res = await axios({
      method: "post",
      url: `https://open-ai.yuis.cc/chat/yui`,
      data: {
        content: msg,
      },
    });
    if (res.data.code == 0) {
      return res.data.data;
    }
    return "对话大模型维护出了什么问题~";
  } catch (error) {
    return "新小冰的接口似乎出问题了？不是很懂=_=";
  }
};

export function getRandomFromArray(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const getTianqi = async function (user: string, msg: string, IceNet: any): Promise<string> {
  return await new Promise(async (resolve, reject) => {
    const dateReg = /(今天|明天|后天|大后天)*天气/;
    const date = msg.match(dateReg)[1];
    let adr = "";
    if (date) {
      adr = msg.substr(0, msg.indexOf(date));
    } else {
      adr = msg.substr(0, msg.indexOf("天气"));
    }
    if (!adr) {
      resolve("你查询了一个寂寞~ \n 天气指令：小冰 地点[时间]天气");
    }
    const vals = await IceNet.city.find({
      where: { addr: Like(`%${adr.split("").join("%")}%`) },
    });
    if (vals.length == 0) {
      resolve(`未查询到地点：${adr}`);
    } else {
      try {
        const res = await axios({
          method: "get",
          url: `https://api.caiyunapp.com/v2.5/${conf.weather.key}/${vals[0].long},${vals[0].lat}/weather.json?alert=true`,
        });
        if (res.data.status == "ok") {
          try {
            const weatherData = res.data.result;
            const weather = weatherData.daily.temperature;
            const weatherCode = weatherData.daily.skycon;
            const alertInfo = weatherData.alert.content;
            const levelCode = {
              "01": "台风",
              "02": "暴雨",
              "03": "暴雪",
              "04": "寒潮",
              "05": "大风",
              "06": "沙尘暴",
              "07": "高温",
              "08": "干旱",
              "09": "雷电",
              10: "冰雹",
              11: "霜冻",
              12: "大雾",
              13: "霾",
              14: "道路结冰",
              15: "森林火灾",
              16: "雷雨大风",
            };
            const warningCode = {
              "01": {
                name: "蓝色",
                color: "blue",
              },
              "02": {
                name: "黄色",
                color: "yellow",
              },
              "03": {
                name: "橙色",
                color: "orange",
              },
              "04": {
                name: "红色",
                color: "red",
              },
            };
            const CodeMap = {
              CLEAR_DAY: 9,
              CLEAR_NIGHT: 9,
              PARTLY_CLOUDY_DAY: 2,
              PARTLY_CLOUDY_NIGHT: 2,
              CLOUDY: 10,
              LIGHT_HAZE: 7,
              MODERATE_HAZE: 7,
              HEAVY_HAZE: 7,
              LIGHT_RAIN: 3,
              MODERATE_RAIN: 3,
              HEAVY_RAIN: 3,
              STORM_RAIN: 3,
              FOG: 7,
              LIGHT_SNOW: 4,
              MODERATE_SNOW: 4,
              HEAVY_SNOW: 4,
              STORM_SNOW: 4,
              DUST: 9,
              SAND: 9,
              WIND: 1,
            };
            let msg = "";
            const tqtype = CodeMap[weatherCode[0].value];
            const tqApi = await axios({
              method: "get",
              url: `https://apis.tianapi.com/tianqishiju/index?key=${conf.weather.tianApi}&tqtype=${tqtype}`,
            });
            if (tqApi.data.code == 200) {
              msg += "查询的天气来啦 \n > " + tqApi.data.result.content + " \n";
            } else {
              msg += "查询的天气来啦 \n";
            }
            if (alertInfo.length > 0) {
              alertInfo.forEach((items) => {
                const code = items.code.split("");
                items.code1 = code[0] + code[1];
                items.code2 = code[2] + code[3];
                msg += `<img src="https://img.shields.io/badge/-${levelCode[items.code1]}-${warningCode[items.code2].color}">`;
              });
              msg += " \n ";
            }
            if (date == "今天") {
              const ndate = new Date(weather[0].date);
              const m = ndate.getMonth() + 1;
              const d = ndate.getDate();
              const url = `https://fishpi.yuis.cc/file/card/index.html?m=${m}&d=${d}&w=${weatherCode[0].value}&a=${Math.ceil(weather[0].avg)}`;
              msg += `<iframe src="${url}" width="250" height="320" frameborder="0"></iframe> \n`;
            } else if (date == "明天") {
              const ndate = new Date(weather[1].date);
              const m = ndate.getMonth() + 1;
              const d = ndate.getDate();
              const url = `https://fishpi.yuis.cc/file/card/index.html?m=${m}&d=${d}&w=${weatherCode[1].value}&a=${Math.ceil(weather[1].avg)}`;
              msg += `<iframe src="${url}" width="250" height="320" frameborder="0"></iframe> \n`;
            } else if (date == "后天") {
              const ndate = new Date(weather[2].date);
              const m = ndate.getMonth() + 1;
              const d = ndate.getDate();
              const url = `https://fishpi.yuis.cc/file/card/index.html?m=${m}&d=${d}&w=${weatherCode[2].value}&a=${Math.ceil(weather[2].avg)}`;
              msg += `<iframe src="${url}" width="250" height="320" frameborder="0"></iframe> \n`;
            } else if (date == "大后天") {
              const ndate = new Date(weather[3].date);
              const m = ndate.getMonth() + 1;
              const d = ndate.getDate();
              const url = `https://fishpi.yuis.cc/file/card/index.html?m=${m}&d=${d}&w=${weatherCode[3].value}&a=${Math.ceil(weather[3].avg)}`;
              msg += `<iframe src="${url}" width="250" height="320" frameborder="0"></iframe> \n`;
            } else {
              const date = [];
              const weatherCodeList = [];
              const max = [];
              const min = [];
              for (let i = 0; i < 5; i++) {
                const ndate = new Date(weather[i].date);
                const m = ndate.getMonth() + 1;
                const d = ndate.getDate();
                date.push(`${m}/${d}`);
                weatherCodeList.push(weatherCode[i].value);
                max.push(weather[i].max);
                min.push(weather[i].min);
              }
              const url = `https://fishpi.yuis.cc/file/card/index2.html?date=${date.join(",")}&weatherCode=${weatherCodeList.join(
                ","
              )}&max=${max.join(",")}&min=${min.join(",")}&t=${adr}&st=${weatherData.forecast_keypoint}`;
              msg += `<iframe src="${url}" width="380" height="370" frameborder="0"></iframe> \n`;
            }
            resolve(msg);
          } catch (e) {
            LOGGER.Log("查询天气异常：" + JSON.stringify(e), 0);
            resolve("小冰的天气接口出错了哦~");
          }
        } else {
          resolve("小冰的天气接口出错了哦~");
        }
      } catch (error) {
        LOGGER.Log("查询天气异常：" + JSON.stringify(error), 0);
        resolve("小冰的天气接口出错了哦~");
      }
    }
  });
};
