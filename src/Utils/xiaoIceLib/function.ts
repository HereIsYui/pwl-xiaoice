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
    const info = await axios({
      method: "GET",
      headers: {
        Host: "music.163.com",
        Origin: "http://music.163.com",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
        referer: "http://music.163.com/search/",
      },
      url: `http://music.163.com/api/song/detail/?id=${mid}&ids=%5B${mid}%5D`,
    });
    let cb = `[music]{"title": "${info.data.songs[0].name}", "coverURL": "${info.data.songs[0].album.picUrl}", "source": "http://music.163.com/song/media/outer/url?id=${mid}","type":"music","from":""}[/music]`;
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
            let msg = "";
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
            msg = `[weather]{"type":"weather","date":"${date.join(",")}","weatherCode":"${weatherCodeList.join(",")}","max":"${max.join(
              ","
            )}","min":"${min.join(",")}","t":"${adr}","st":"${weatherData.forecast_keypoint}"}[/weather]`;
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
