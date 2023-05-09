import { configInfo as conf, writeConfig } from '../Utils/config';
import { wyydiange, setAdmin, EmptyCall, getTianqi, GetXiaoIceGameRank, getActivutyRanking, chatWithXiaoAi } from './function';
import type FishPi from 'fishpi'
import { LOGGER } from './logger';
import { Finger, FingerTo, RedPacketType } from 'fishpi';

const GlobalData = {
  pointList: [],
  benbenArray: [],
  benbenTimeout: null,
  lastbenbenTime: 0,
  RedPacketDate: 0,
  isSendRedPacket: false,
  TodayRedPacketDate: 0,
  isSendTodayRedPacket: false,
  oIdList: [],
}
export const GlobalRuleList = [{
  rule: /^点歌/,
  func: async (user: string, msg: string, fish: FishPi, IceNet?: any) => {
    let cb = await wyydiange(user, msg);
    return cb;
  }
}, {
  rule: /^(添加管理|删除管理)/,
  func: async (user: string, msg: string, fish: FishPi, IceNet?: any) => {
    let cb = await setAdmin(user, msg);
    return cb;
  }
}, {
  rule: /^微信群$/,
  func: async (user: string, msg: string, fish: FishPi, IceNet?: any) => {
    let cb = "![微信群](https://pwl.yuis.cc/fishpi.png)";
    return cb;
  }
}, {
  rule: /^禅定 \d+/,
  func: async (user: string, msg: string, fish: FishPi, IceNet?: any) => {
    let cb = "禅定功能修复中~";
    return cb;
  }
}, {
  rule: /^强行禅定/,
  func: async (user: string, msg: string, fish: FishPi, IceNet?: any) => {
    let str = msg.split(" ");
    let cb = "";
    let usr = str[1];
    if (!usr || usr == 'xiaoIce' || usr == 'Yui' || usr == 'sevenSummer') {
      usr = user
    }
    let rt = parseInt(str[2]) || 10;
    if (conf.admin.includes(user)) {
      if (rt) {
        cb = `zf jy ${usr} ${rt}`
      } else {
        cb = "时间参数错误，请发送[强行禅定 用户 时长(分钟)]如：[禅定 Yui 10]"
      }
    } else {
      cb = "ohhhh~你没得权限呐，骚年"
    }
    return cb;
  }
}, {
  rule: /^破戒 .{0,20}/,
  func: async (user: string, msg: string, fish: FishPi, IceNet?: any) => {
    let str = msg.split(" ");
    let cb = "";
    let usr = str[1];
    if (conf.admin.includes(user)) {
      cb = `zf jy ${usr} 0`
    } else {
      cb = "ohhhh~你没得权限呐，骚年"
    }
    return cb;
  }
}, {
  rule: /^合议禅定 .{0,20}/,
  func: async (user: string, msg: string, fish: FishPi, IceNet?: any) => {
    let cb = "";
    GlobalData.pointList.push(user);
    usePoint()
    return cb;
  }
}, {
  rule: /^请崖主回山/,
  func: async (user: string, msg: string, fish: FishPi, IceNet?: any) => {
    let cb = "";
    if ((new Date().getTime() - GlobalData.lastbenbenTime) > 5 * 60 * 1000) {
      if (!GlobalData.benbenArray.includes(user)) {
        clearTimeout(GlobalData.benbenTimeout);
        GlobalData.benbenArray.push(user)
        cb = `已收到，目前已收到[${GlobalData.benbenArray.length}]人的请求，15s内无人请将结算`;
        GlobalData.benbenTimeout = setTimeout(() => {
          let NPeople = GlobalData.benbenArray.length;
          let m = Math.round(NPeople * 30 / 60);
          if (m < 1) {
            m = 1
          }
          if (m > 3) {
            m = 6
          }
          if (NPeople < 3) {
            fish.chatroom.send(`风流：就这点人请我回去？你们什么档次？`);
            GlobalData.benbenArray = [];
          } else {
            fish.chatroom.send(`开始结算，共计${NPeople}人请崖主，崖主回山${m}分钟`)
            cb = `zf jy dissoluteFate ${m}`;
            GlobalData.lastbenbenTime = new Date().getTime();
            GlobalData.benbenArray = [];
            fish.chatroom.send(cb)
          }
        }, 15 * 1000)
      } else {
        cb = `你已经投票过了！`
      }
    } else {
      cb = `风流还在复活ing~`
    }
    return cb;
  }
}, {
  rule: /^TTS|^朗读/i,
  func: async (user: string, msg: string, fish: FishPi, IceNet?: any) => {
    const link =
      Buffer.from(
        'aHR0cHM6Ly9kaWN0LnlvdWRhby5jb20vZGljdHZvaWNlP2xlPXpoJmF1ZGlvPQ==',
        'base64'
      ) + encodeURIComponent(msg.replace(/^TTS|^朗读/i, '')),
      cb = `那你可就听好了<br><audio src='${link}' controls/>`
    return cb
  }
}, {
  rule: /^小冰/,
  func: async (user: string, msg: string, fish: FishPi, IceNet?: any) => {
    let cb = await GetXiaoIceMsg(user, msg, fish, IceNet);
    return cb;
  }
}]

async function usePoint() {
  if (GlobalData.pointList.length > 0) {
    let user = GlobalData.pointList.shift();
    await startUsePoint(user)
  }
}

async function startUsePoint(user: string) {
  try {
    await FingerTo(conf.keys.point).editUserPoints(user, -64, "聊天室合议禅定为应急预案,64积分已扣除")
    usePoint()
  } catch (e) {
    LOGGER.Err(`扣除${user}积分失败`, e);
    return false;
  }
}

async function GetXiaoIceMsg(user: string, msg: string, fish: FishPi, IceNet?: any) {
  let message = msg.replace(/^(小冰|小爱(同学)?|嘿?[，, ]?siri)/i, '');
  message = message.trim();
  let cb = "";
  for (let r of XiaoIceRuleList) {
    if (r.rule.test(message)) {
      LOGGER.Log(`收到${user}的指令：${message}`, 1)
      cb = await r.func(user, message, fish, IceNet);
      break;
    }
  }
  return cb;

}



const XiaoIceRuleList = [{
  rule: /^\s*$/,
  func: async (user: string, message: string, fish: FishPi, IceNet?: any) => {
    let cb = "";
    if (Math.random() > 0.2) {
      cb = EmptyCall(user)
    }
    return cb;
  }
}, {
  rule: /^(菜单|功能)(列表)?$/,
  func: async (user: string, message: string, fish: FishPi, IceNet?: any) => {
    let cb = `功能列表:\n	1. 直接发短语即可聊天。\n2. 全局发送[TTS+文本]或[朗读+文本]即可朗读(无需关键词)\n3. 回复[xxx天气]可以查询天气`;
    return cb;
  }
}, {
  rule: /叫我\w*/,
  func: async (user: string, message: string, fish: FishPi, IceNet?: any) => {
    let uwantName = message.substring(2).trim();
    let cb = "";
    if (IceNet.UDetail.intimacy < 500) {
      cb = `${IceNet.UName},咱俩的关系还没到称呼${uwantName}的时候哦~`
    } else {
      cb = `好的~以后我就叫你${uwantName}啦`;
      let nUser = IceNet.UDetail;
      nUser.nick_name = uwantName;
      IceNet.user.update(IceNet.UDetail.id, nUser)
    }
    return cb;
  }
}, {
  rule: /亲密度/,
  func: async (user: string, message: string, fish: FishPi, IceNet?: any) => {
    let cb = `当前亲密度为: ${IceNet.UDetail.intimacy}`;
    return cb;
  }
}, {
  rule: /\w*天气/,
  func: async (user: string, message: string, fish: FishPi, IceNet?: any) => {
    let cb = await getTianqi(user, message, IceNet)
    return cb;
  }
}, {
  rule: /(当前|现在|今日|水多)(吗|少了)?(活跃)?值?$/,
  func: async (user: string, message: string, fish: FishPi, IceNet?: any) => {
    let cb = "";
    if (conf.admin.includes(user)) {
      let msg = await fish.account.liveness()
      cb = `小冰当前活跃值为：${msg}`;
    } else {
      cb = `小冰不知道你的活跃哦~`
    }
    return cb;
  }
}, {
  rule: /(去打劫|发工资)了?吗?$/,
  func: async (user: string, message: string, fish: FishPi, IceNet?: any) => {
    let cb = "";
    if (conf.admin.includes(user)) {
      let msg = await fish.account.rewardLiveness();
      let isDajie = !message.match('工资');
      cb = `小冰${isDajie ? '打劫回来' : '发工资'}啦！一共获得了${msg >= 0 ? msg + '点积分~' : '0点积分，不要太贪心哦~'}`;
    } else {
      cb = `本是要去的，但是转念一想，尚有这么多事情要做，便也就放弃了罢`;
    }
    return cb;
  }
}, {
  rule: /(发个|来个)红包$/,
  func: async (user: string, message: string, fish: FishPi, IceNet?: any) => {
    let cb = "";
    let now = new Date().getDate();
    if (conf.admin.includes(user)) {
      // 概率暂时设置成5%吧，以后在改成次数限制
      if (Math.random() > 0.95) {
        if (now != GlobalData.RedPacketDate) {
          GlobalData.isSendRedPacket = false;
        }
        if (!GlobalData.isSendRedPacket) {
          GlobalData.isSendRedPacket = true;
          GlobalData.RedPacketDate = now;
          fish.chatroom.redpacket.send({
            type: RedPacketType.Random,
            msg: "最！后！一！个！别再剥削我了！！！！",
            money: 200,
            count: 3
          })
          cb = "";
        } else {
          cb = `今天已经发过了！你发我一个啊！`
        }
      } else {
        cb = `不给了！不给了！光找我要红包，你倒是给我一个啊！本来工资就不高，还天天剥削我！！！`
      }
    } else {
      if (now != GlobalData.TodayRedPacketDate) {
        GlobalData.isSendTodayRedPacket = false;
      }
      if (Math.random() > 0.95) {
        if (!GlobalData.isSendTodayRedPacket) {
          GlobalData.isSendTodayRedPacket = true;
          GlobalData.TodayRedPacketDate = now;
          fish.chatroom.redpacket.send({
            type: RedPacketType.Specify,
            msg: "偷偷发给你的哦，不要给别人说！",
            money: Math.floor(Math.random() * 32 + 32),
            count: 1,
            recivers: [user]
          })
          cb = "";
        } else {
          cb = `这件事已不必再提，皆因钱财不够`
        }
      } else {
        cb = `这件事已不必再提，皆因钱财不够`
      }
    }
    return cb;
  }
}, {
  rule: /^等级排行(榜?)$/,
  func: async (user: string, message: string, fish: FishPi, IceNet?: any) => {
    let cb = await GetXiaoIceGameRank();
    return cb;
  }
}, {
  rule: /撤回\d*$/,
  func: async (user: string, message: string, fish: FishPi, IceNet?: any) => {
    let cb = "";
    if (conf.admin.includes(user)) {
      let msg = message.substr(message.indexOf('撤回') + 2).trim();
      try {
        let num = parseInt(msg);
        let deleteList = GlobalData.oIdList.splice(0, num);
        deleteList.forEach(async function (oId) {
          fish.chatroom.revoke(oId);
        })
        cb = `撤回完成，共计撤回${num}条消息。`;
      } catch (e) {
        cb = `撤回失败，请检查日志。`;
      }
    } else {
      cb = `暂无权限~`;
    }
    return cb;
  }
}, {
  rule: /(今天|明天|后天|早上|中午|晚上).{0,4}吃(啥|什么)/,
  func: async (user: string, message: string, fish: FishPi, IceNet?: any) => {
    let foodList = ['馄饨', '拉面', '烩面', '热干面', '刀削面', '油泼面', '炸酱面', '炒面', '重庆小面', '米线', '酸辣粉', '土豆粉', '螺狮粉', '凉皮儿', '麻辣烫', '肉夹馍', '羊肉汤', '炒饭', '盖浇饭', '卤肉饭', '烤肉饭', '黄焖鸡米饭', '驴肉火烧', '川菜', '麻辣香锅', '火锅', '酸菜鱼', '烤串', '西北风', '披萨', '烤鸭', '汉堡', '炸鸡', '寿司', '蟹黄包', '煎饼果子', '生煎', '炒年糕'];
    let food = Math.floor(Math.random() * foodList.length);
    let cb = `不知道吃啥那就吃 [${foodList[food]}] 吧`
    return cb;
  }
}, {
  rule: /^活动排行(榜?)$/,
  func: async (user: string, message: string, fish: FishPi, IceNet?: any) => {
    let cb = getActivutyRanking('年终征文2022')
    return cb;
  }
}, {
  rule: /.*/,
  func: async (user: string, message: string, fish: FishPi, IceNet?: any) => {
    let cb = await chatWithXiaoAi(message);
    return cb;
  }
}]