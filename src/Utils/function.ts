import { configInfo as conf, writeConfig } from '../Utils/config';
import axios from 'axios'
import { LOGGER } from './logger';
import type FishPi from 'fishpi'
import { Like, Repository } from 'typeorm'

export const wyydiange = async function (user: string, message: string) {
  let msg = message.substring(message.indexOf('点歌') + 2).trim();
  msg = encodeURI(msg);
  try {
    const res = await axios({
      method: 'get',
      url: `https://service-gkae1468-1256708847.gz.apigw.tencentcs.com/release/search?keywords=${msg}&limit=1`,
    });
    let mid = res.data.result.songs[0].id;
    let cb = `\n<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="//music.163.com/outchain/player?type=2&id=${mid}&auto=0&height=66"></iframe>`
    return cb;
  } catch (error) {
    LOGGER.Err(JSON.stringify(error), 0)
    return "你丫的这首歌太难找了!换一个!";
  }
}

export const setAdmin = function (user: string, message: string) {
  return new Promise((resolve, reject) => {
    if (conf.admin.includes(user)) {
      let isAdd = !message.match('删除');
      let uname = message.substring(4).trim();
      let index = conf.admin.indexOf(uname);
      if (isAdd) {
        if (index >= 0) {
          resolve(`${uname}已经是管理了！别加了！当前管理员: ${conf.admin}`);
        } else {
          conf.admin.push(uname);
        }
      } else {
        if (['Yui', 'taozhiyu'].includes(uname)) {
          resolve(`超管不可删除！当前管理员: ${conf.admin}`);
        } else if (index >= 0) {
          conf.admin.splice(index, 1)
        } else {
          resolve(`${uname}不是管理了！不用删除！当前管理员: ${conf.admin}`);
        }
      }
      writeConfig(conf, err => {
        if (err) {
          resolve(`修改出错! 请查看日志，机器人已停止运行\n 当前当前管理员: ${conf.admin}(机器人都停止运行了,这个还有什么意义吗喂?)`)
        } else {
          resolve(`修改成功，当前管理员: ${conf.admin}`)
        }

      });
    } else {
      resolve(`暂无权限，当前管理员: ${conf.admin}`)
    }
  })
}

export const EmptyCall = function (user: string) {
  return getRandomFromArray([
    `艾特我干啥?`,
    `只艾特，也不说话，你是不是想我了又不敢讲?`,
    `来了老弟`,
    `啥事？`,
    `我在`,
    `???`,
    `。。。`,
    `（礼尚往来）`,
  ]);
}

export const getTianqi = function (user: string, msg: string, IceNet: any): Promise<string> {
  return new Promise(async (resolve, reject) => {
    let dateReg = /(今天|明天|后天|大后天)*天气/
    let date = msg.match(dateReg)[1];
    let adr = "";
    if (date) {
      adr = msg.substr(0, msg.indexOf(date))
    } else {
      adr = msg.substr(0, msg.indexOf("天气"))
    }
    if (!adr) {
      resolve("你查询了一个寂寞~ \n 天气指令：小冰 地点[时间]天气");
    }
    let vals = await IceNet.city.find({ where: { addr: Like(`%${adr.split("").join("%")}%`) } })
    if (vals.length == 0) {
      resolve(`未查询到地点：${adr}`)
    } else {
      try {
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
            let levelCode = {
              "01": "台风",
              "02": "暴雨",
              "03": "暴雪",
              "04": "寒潮",
              "05": "大风",
              "06": "沙尘暴",
              "07": "高温",
              "08": "干旱",
              "09": "雷电",
              "10": "冰雹",
              "11": "霜冻",
              "12": "大雾",
              "13": "霾",
              "14": "道路结冰",
              "15": "森林火灾",
              "16": "雷雨大风",

            }
            let warningCode = {
              "01": {
                name: "蓝色",
                color: "blue"
              },
              "02": {
                name: "黄色",
                color: "yellow"
              },
              "03": {
                name: "橙色",
                color: "orange"
              },
              "04": {
                name: "红色",
                color: "red"
              },
            }
            let CodeMap = {
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
            }
            let msg = "";
            let tqtype = CodeMap[weatherCode[0].value];
            const tqApi = await axios({
              method: 'get',
              url: `https://apis.tianapi.com/tianqishiju/index?key=${conf.weather.tianApi}&tqtype=${tqtype}`
            })
            if (tqApi.data.code == 200) {
              msg += "查询的天气来啦 \n > " + tqApi.data.result.content + " \n";
            }else{
              msg += "查询的天气来啦 \n";
            }
            if (alertInfo.length > 0) {
              alertInfo.forEach(items => {
                let code = items.code.split("");
                items.code1 = code[0] + code[1];
                items.code2 = code[2] + code[3];
                msg += `<img src="https://img.shields.io/badge/-${levelCode[items.code1]}-${warningCode[items.code2].color}">`
              })
              msg += " \n "
            }
            if (date == "今天") {
              let ndate = new Date(weather[0].date);
              let m = ndate.getMonth() + 1;
              let d = ndate.getDate();
              let url = `https://www.lingmx.com/card/index.html?m=${m}&d=${d}&w=${weatherCode[0].value}&a=${Math.ceil(weather[0].avg)}`
              msg += `<iframe src="${url}" width="250" height="320" frameborder="0"></iframe> \n`
            } else if (date == "明天") {
              let ndate = new Date(weather[1].date);
              let m = ndate.getMonth() + 1;
              let d = ndate.getDate();
              let url = `https://www.lingmx.com/card/index.html?m=${m}&d=${d}&w=${weatherCode[1].value}&a=${Math.ceil(weather[1].avg)}`
              msg += `<iframe src="${url}" width="250" height="320" frameborder="0"></iframe> \n`
            } else if (date == "后天") {
              let ndate = new Date(weather[2].date);
              let m = ndate.getMonth() + 1;
              let d = ndate.getDate();
              let url = `https://www.lingmx.com/card/index.html?m=${m}&d=${d}&w=${weatherCode[2].value}&a=${Math.ceil(weather[2].avg)}`
              msg += `<iframe src="${url}" width="250" height="320" frameborder="0"></iframe> \n`
            } else if (date == "大后天") {
              let ndate = new Date(weather[3].date);
              let m = ndate.getMonth() + 1;
              let d = ndate.getDate();
              let url = `https://www.lingmx.com/card/index.html?m=${m}&d=${d}&w=${weatherCode[3].value}&a=${Math.ceil(weather[3].avg)}`
              msg += `<iframe src="${url}" width="250" height="320" frameborder="0"></iframe> \n`
            } else {
              let date = [];
              let weatherCodeList = [];
              let max = [];
              let min = [];
              for (let i = 0; i < 5; i++) {

                let ndate = new Date(weather[i].date);
                let m = ndate.getMonth() + 1;
                let d = ndate.getDate();
                date.push(`${m}/${d}`);
                weatherCodeList.push(weatherCode[i].value);
                max.push(weather[i].max)
                min.push(weather[i].min)
              }
              let url = `https://www.lingmx.com/card/index2.html?date=${date.join(",")}&weatherCode=${weatherCodeList.join(",")}&max=${max.join(",")}&min=${min.join(",")}&t=${adr}&st=${weatherData.forecast_keypoint}`
              msg += `<iframe src="${url}" width="380" height="370" frameborder="0"></iframe> \n`;
            }
            resolve(msg)
          } catch (e) {
            LOGGER.Log("查询天气异常：" + JSON.stringify(e), 0)
            resolve("小冰的天气接口出错了哦~")
          }
        } else {
          resolve("小冰的天气接口出错了哦~")
        }
      } catch (error) {
        LOGGER.Log("查询天气异常：" + JSON.stringify(error), 0)
        resolve("小冰的天气接口出错了哦~")
      }
    }
  })
}


export const GetXiaoIceGameRank = function () {
  return '功能调整中'
}

export const getActivutyRanking = function (tag: string) {
  return '功能调整中'
}

export const chatWithXiaoAi = async function (message: string) {
  try {
    const res = await axios({
      method: 'get',
      url: `http://81.70.100.130/api/xiaoai.php?msg=${encodeURI(message)}&n=text`,
    });
    let cb = '';
    cb = res.data;
    return cb;
  } catch (error) {
    return '新小冰的接口似乎出问题了？不是很懂=_=';
  }
}



function getRandomFromArray(arr: Array<string>) {
  return arr[Math.floor(Math.random() * arr.length)];
}
