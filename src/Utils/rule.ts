import { configInfo as conf, writeConfig } from "../Utils/config";
import {
  wyydiange,
  setAdmin,
  EmptyCall,
  getTianqi,
  GetXiaoIceGameRank,
  getActivutyRanking,
  chatWithXiaoAi,
  chatWithXiaoBing,
} from "./function";
import type FishPi from "fishpi";
import { LOGGER } from "./logger";
import * as dayjs from "dayjs";
import { Finger, FingerTo, RedPacketType } from "fishpi";
import { BankRecords } from "src/entities/bankrecord.entities";
import { Bank } from "src/entities/bank.entities";
import { UbagItem } from "./type";

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
};
export const GlobalRuleList = [
  {
    rule: /^点歌/,
    func: async (user: string, msg: string, fish: FishPi, IceNet?: any) => {
      let cb = `\n > 滴~ 你点的歌来了 `;
      cb += await wyydiange(user, msg);
      return cb;
    },
  },
  {
    rule: /@xiaoIce\s+你的连接被管理员断开，请重新连接。/,
    func: async (user: string, msg: string, fish: FishPi, IceNet?: any) => {
      let cb = "";
      if (user !== "摸鱼派官方巡逻机器人") return;
      setTimeout(async () => {
        await fish.chatroom.reconnect({ timeout: conf.chatroom.timeout });
        LOGGER.Log(`已重连${dayjs().valueOf()}`, 0);
      }, conf.chatroom.timeout * 1000);
      return cb;
    },
  },
  {
    rule: /由于您超过6小时未活跃/,
    func: async (user: string, msg: string, fish: FishPi, IceNet?: any) => {
      let cb = "";
      if (user !== "摸鱼派官方巡逻机器人") return;
      setTimeout(async () => {
        await fish.chatroom.reconnect({ timeout: conf.chatroom.timeout });
        LOGGER.Log(`已重连${dayjs().valueOf()}`, 0);
      }, conf.chatroom.timeout * 1000);
      return cb;
    },
  },
  {
    rule: /^(添加管理|删除管理)/,
    func: async (user: string, msg: string, fish: FishPi, IceNet?: any) => {
      let cb = await setAdmin(user, msg);
      return cb;
    },
  },
  {
    rule: /^微信群$/,
    func: async (user: string, msg: string, fish: FishPi, IceNet?: any) => {
      let cb = "![微信群](https://pwl.yuis.cc/fishpi.png)";
      return cb;
    },
  },
  {
    rule: /(56c0f695|乌拉)/,
    func: async (user: string, msg: string, fish: FishPi, IceNet?: any) => {
      let cb = "";
      // if (user != 'sevenSummer') {
      //   cb = "![乌拉乌拉](https://pwl.stackoverflow.wiki/2022/03/image-56c0f695.png)";
      // }
      return cb;
    },
  },
  {
    rule: /^禅定 \d+/,
    func: async (user: string, msg: string, fish: FishPi, IceNet?: any) => {
      let cb = "禅定功能修复中~";
      return cb;
    },
  },
  {
    rule: /^强行禅定/,
    func: async (user: string, msg: string, fish: FishPi, IceNet?: any) => {
      let str = msg.split(" ");
      let cb = "";
      let usr = str[1];
      if (!usr || usr == "xiaoIce" || usr == "Yui" || usr == "sevenSummer") {
        usr = user;
      }
      let rt = parseInt(str[2]) || 10;
      if (conf.admin.includes(user)) {
        if (rt) {
          cb = `zf jy ${usr} ${rt}`;
        } else {
          cb =
            "时间参数错误，请发送[强行禅定 用户 时长(分钟)]如：[禅定 Yui 10]";
        }
      } else {
        cb = "ohhhh~你没得权限呐，骚年";
      }
      return cb;
    },
  },
  {
    rule: /^破戒 .{0,20}/,
    func: async (user: string, msg: string, fish: FishPi, IceNet?: any) => {
      let str = msg.split(" ");
      let cb = "";
      let usr = str[1];
      if (conf.admin.includes(user)) {
        cb = `zf jy ${usr} 0`;
      } else {
        cb = "ohhhh~你没得权限呐，骚年";
      }
      return cb;
    },
  },
  {
    rule: /^合议禅定 .{0,20}/,
    func: async (user: string, msg: string, fish: FishPi, IceNet?: any) => {
      let cb = "";
      GlobalData.pointList.push(user);
      usePoint();
      return cb;
    },
  },
  {
    rule: /^请崖主回山/,
    func: async (user: string, msg: string, fish: FishPi, IceNet?: any) => {
      let cb = "";
      if (new Date().getTime() - GlobalData.lastbenbenTime > 5 * 60 * 1000) {
        if (!GlobalData.benbenArray.includes(user)) {
          clearTimeout(GlobalData.benbenTimeout);
          GlobalData.benbenArray.push(user);
          cb = `已收到，目前已收到[${GlobalData.benbenArray.length}]人的请求，15s内无人请将结算`;
          GlobalData.benbenTimeout = setTimeout(() => {
            let NPeople = GlobalData.benbenArray.length;
            let m = Math.round((NPeople * 30) / 60);
            if (m < 1) {
              m = 1;
            }
            if (m > 3) {
              m = 6;
            }
            if (NPeople < 3) {
              IceNet.sendMsg(`风流：就这点人请我回去？你们什么档次？`);
              GlobalData.benbenArray = [];
            } else {
              IceNet.sendMsg(
                `开始结算，共计${NPeople}人请崖主，崖主回山${m}分钟`
              );
              cb = `zf jy dissoluteFate ${m}`;
              GlobalData.lastbenbenTime = new Date().getTime();
              GlobalData.benbenArray = [];
              IceNet.sendMsg(cb);
            }
          }, 15 * 1000);
        } else {
          cb = `你已经投票过了！`;
        }
      } else {
        cb = `风流还在复活ing~`;
      }
      return cb;
    },
  },
  {
    rule: /^TTS|^朗读/i,
    func: async (user: string, msg: string, fish: FishPi, IceNet?: any) => {
      const link =
          Buffer.from(
            "aHR0cHM6Ly9kaWN0LnlvdWRhby5jb20vZGljdHZvaWNlP2xlPXpoJmF1ZGlvPQ==",
            "base64"
          ) + encodeURIComponent(msg.replace(/^TTS|^朗读/i, "")),
        cb = `那你可就听好了<br><audio src='${link}' controls/>`;
      return cb;
    },
  },
  {
    rule: /^小冰(dev)?/,
    func: async (user: string, msg: string, fish: FishPi, IceNet?: any) => {
      let cb = await GetXiaoIceMsg(user, msg, fish, IceNet);
      return cb;
    },
  },
];

const XiaoIceRuleList = [
  {
    rule: /^\s*$/,
    func: async (user: string, message: string, fish: FishPi, IceNet?: any) => {
      let cb = "";
      if (Math.random() > 0.2) {
        cb = EmptyCall(user);
      }
      return cb;
    },
  },
  {
    rule: /^(菜单|功能)(列表)?$/,
    func: async (user: string, message: string, fish: FishPi, IceNet?: any) => {
      let cb = `功能列表:\n	1. 直接发短语即可聊天。\n2. 全局发送[TTS+文本]或[朗读+文本]即可朗读(无需关键词)\n3. 回复[xxx天气]可以查询天气`;
      return cb;
    },
  },
  {
    rule: /我是谁|叫我什么/,
    func: async (user: string, message: string, fish: FishPi, IceNet?: any) => {
      let cb = `当然是: ${IceNet.UName}啦:blush:  \n > 注意 首次命名免费, 之后每次改名消耗50亲密度`;
      return cb;
    },
  },
  {
    rule: /银行(帮助|说明)?/,
    func: async (user: string, message: string, fish: FishPi, IceNet?: any) => {
      let cb = `\n ![IceBank](https://file.fishpi.cn/2023/05/image-c00afb3d.png) \n 当当当当,这里是IceBank \n - 存款请发专属红包并备注\`存款\`或直接转账或发送指令 [小冰 存款 金额] \n - 取款请发送指令 [小冰 取款 金额]`;
      return cb;
    },
  },
  {
    rule: /账户$/,
    func: async (user: string, message: string, fish: FishPi, IceNet?: any) => {
      let uBank = await IceNet.bank.findOne({ where: { user } });
      let cb = "";
      if (uBank && uBank.id) {
        cb = `\n【IceBank:credit_card:】${
          uBank.point > 1000000
            ? "钻石SVIP"
            : uBank.point > 200000
            ? "铂金VIP"
            : ""
        }储户信息: \n 卡号: ${uBank.bank_id} \n 余额: ${uBank.point}积分`;
        if (uBank.point > 100000) {
          cb += ` \n > 个,十,百,千,万,爸爸,爷爷,祖宗,(¯﹃¯)`;
        } else {
          cb += ` \n > 存款达到20w可以定制卡号哦`;
        }
      } else {
        cb = `你还没有开户哦:credit_card: \n > 给小冰发专属红包开户并备注\`存款\`不备注的算赠与哦`;
      }
      return cb;
    },
  },
  {
    rule: /存款? \d{0,9}$/,
    func: async (user: string, message: string, fish: FishPi, IceNet?: any) => {
      let pointNum = Math.abs(parseInt(message.split(" ")[1] || "0"));
      let cb = "";
      if (pointNum <= 100000000 && pointNum > 0) {
        let userDetail = await fish.user(user);
        let userPoint = userDetail.userPoint;
        let OrderId = "IceBank-" + dayjs().format("YYYYMMDDHHmmssSSS");
        if (userPoint > pointNum) {
          await FingerTo(conf.keys.point).editUserPoints(
            user,
            -pointNum,
            `IceBank-聊天室${user}存款${pointNum}积分`
          );
          await FingerTo(conf.keys.point).editUserPoints(
            "xiaoIce",
            pointNum,
            `IceBank-聊天室${user}存款${pointNum}积分`
          );
          let uBank: Bank = await IceNet.bank.findOne({ where: { user } });
          let uRecord = new BankRecords();
          uRecord.order_id = OrderId;
          uRecord.user = user;
          uRecord.data_id = dayjs().valueOf().toString();
          uRecord.point = pointNum.toString();
          uRecord.access = 0;
          uRecord.access_type = 3;
          if (uBank && uBank.id) {
            uRecord.balance = (parseInt(uBank.point) + pointNum).toString();
            uRecord.is_success = 1;
            await IceNet.bankRecords.save(uRecord);
            uBank.point = (parseInt(uBank.point) + pointNum).toString();
            await IceNet.bank.update(uBank.id, uBank);
            cb = `【IceBank-交易通知】交易积分:${pointNum} \n 交易方式:存 \n 余额:${uBank.point} \n 交易单号:${OrderId}`;
          } else {
            let newUser = new Bank();
            newUser.uId = IceNet.UDetail.uId;
            newUser.user = user;
            newUser.point = pointNum.toString();
            newUser.bank_id = "ICE" + new Date().getTime().toString();
            await IceNet.bank.save(newUser);
            uRecord.uId = IceNet.UDetail.uId;
            uRecord.balance = "0";
            uRecord.is_success = 1;
            await IceNet.bankRecords.save(uRecord);
            IceNet.sendMsg(
              `@${user} ,【IceBank-开户成功通知】:交易积分:${pointNum} \n 交易方式:存 \n 交易单号:${OrderId} \n 卡号:${newUser.bank_id}`
            );
          }
        } else {
          cb = `【IceBank-交易失败通知】交易积分:${pointNum} \n 交易方式:存 \n 失败原因:你的余额不足 \n 交易单号:${OrderId}`;
        }
      } else {
        cb = `【IceBank-交易失败通知】单次存取不得大于10w,不得小于0`;
      }
      return cb;
    },
  },
  {
    rule: /取款? \d{0,9}$/,
    func: async (user: string, message: string, fish: FishPi, IceNet?: any) => {
      let pointNum = Math.abs(parseInt(message.split(" ")[1] || "0"));
      let cb = "";
      if (pointNum > 0 && pointNum < 100000000) {
        let uBank: Bank = await IceNet.bank.findOne({ where: { user } });
        let OrderId = "IceBank-" + dayjs().format("YYYYMMDDHHmmssSSS");
        if (uBank && uBank.id) {
          if (parseInt(uBank.point) > pointNum) {
            let uRecord = new BankRecords();
            uRecord.order_id = OrderId;
            uRecord.user = user;
            uRecord.data_id = dayjs().valueOf().toString();
            uRecord.point = pointNum.toString();
            uRecord.access = 1;
            uRecord.access_type = 0;
            uRecord.is_success = 1;
            uRecord.uId = uBank.uId;
            uRecord.balance = (parseInt(uBank.point) - pointNum).toString();
            uBank.point = (parseInt(uBank.point) - pointNum).toString();
            await IceNet.bank.update(uBank.id, uBank);
            await IceNet.bankRecords.save(uRecord);
            await fish.account.transfer(
              user,
              pointNum,
              `小冰银行取款${pointNum}积分`
            );
            cb = `【IceBank-交易通知】交易积分:${pointNum} \n 交易方式:取 \n 本次取款将通过转账方式到账,请注意查收 \n 余额:${uBank.point} \n 交易单号:${OrderId}`;
          } else {
            cb = `【IceBank-交易失败通知】交易积分:${pointNum} \n 交易方式:取 \n 失败原因:你的余额不足 \n 交易单号:${OrderId}`;
          }
        } else {
          cb = `你还没有开户哦:credit_card: \n > 给小冰发专属红包开户并备注\`存款\`不备注的算赠与哦`;
        }
      } else {
        cb = `指令错误 取款指令示例[小冰 取款 100] \n > 取款最低1积分,最高10w积分`;
      }
      return cb;
    },
  },
  {
    rule: /叫我\w{0,5}/,
    func: async (user: string, message: string, fish: FishPi, IceNet?: any) => {
      let uwantName = message.substring(2).trim();
      let cb = "";
      if (IceNet.UDetail.intimacy < 500) {
        cb = `${IceNet.UName},咱俩的关系还没到称呼\`${uwantName}\`的时候哦:angry: \n > 注意 首次命名免费, 之后每次改名消耗50亲密度`;
      } else {
        uwantName = uwantName.substring(0, 5);
        uwantName = uwantName.replace(
          /[`~!@#$^\-&*()=|{}':;',\\\[\]\.<>\/?~！@#￥……&*（）——|{}【】'；：""'。，、？\s]/g,
          ""
        );
        uwantName = uwantName.replace(
          /(Yui|爸|爷|爹|dad|天道|阿达|ba|主|祖|妈|爺|媽|輝|辉|逼|b)/gi,
          ""
        );
        if (IceNet.UDetail.user == "xiong" && uwantName.indexOf("帅哥") >= 0) {
          uwantName = "衰哥";
        }
        cb = `好的~以后我就叫你${uwantName}啦:stuck_out_tongue_winking_eye: \n > 注意 首次命名免费, 之后每次改名消耗50亲密度`;
        let nUser = IceNet.UDetail;
        if (nUser.nick_name != "") {
          nUser.intimacy = nUser.intimacy - 50;
          cb += "\n > 天天改名, 天天改名! 小冰快记不住啦!";
        }
        nUser.nick_name = uwantName;
        IceNet.user.update(nUser.id, nUser);
      }
      return cb;
    },
  },
  {
    rule: /亲密度/,
    func: async (user: string, message: string, fish: FishPi, IceNet?: any) => {
      let cb = `当前亲密度为: ${IceNet.UDetail.intimacy}:two_hearts: \n > 召唤小冰,送鱼丸鱼翅,红包都可以增加亲密度哦`;
      return cb;
    },
  },
  {
    rule: /信用分/,
    func: async (user: string, message: string, fish: FishPi, IceNet?: any) => {
      let Info = await IceNet.credit.find({ where: { user } });
      let cb = "";
      if (Info.length !== 0) {
        let IceScore =
          Info[0].base_score +
          Info[0].activity_score +
          Info[0].reward_score +
          Info[0].credit_score;
        cb = `当前信用分为: ${IceScore}:star2:`;
        cb += `\n - 基础分: ${Info[0].base_score} \'分值构成: 注册时长最高+120分, 小冰亲密度最高+80分\'`;
        cb += `\n - 活跃分: ${Info[0].activity_score} \'分值构成: 本周周跃情况最高+200分\'`;
        cb += `\n - 奖励分: ${Info[0].reward_score} \'分值构成: 每天找小冰打劫最高+70分, 每天发红包最高+130分\'`;
        cb += `\n - 赌狗分: ${Info[0].credit_score} \'分值构成: 基础100分, 按赌狗红包输赢和次数加减\'`;
        cb += `\n > 信用分每天更新,每周重置`;
      } else {
        cb = "暂无信用记录 \n > 小冰亲密度达到10以上, 第二天才会计算信用分哦";
      }
      return cb;
    },
  },
  {
    rule: /^我是(姐姐|哥哥)/,
    func: async (user: string, message: string, fish: FishPi, IceNet?: any) => {
      let gender = message.indexOf("哥哥") >= 0 ? 1 : 0;
      let nUser = IceNet.UDetail;
      nUser.gender = gender;
      IceNet.user.update(nUser.id, nUser);
      let cb = `好的,已修正性别:smiling_imp:`;
      return cb;
    },
  },
  {
    rule: /\w*天气/,
    func: async (user: string, message: string, fish: FishPi, IceNet?: any) => {
      let cb = await getTianqi(user, message, IceNet);
      return cb;
    },
  },
  {
    rule: /(当前|现在|今日|水多)(吗|少了)?(活跃)?值?$/,
    func: async (user: string, message: string, fish: FishPi, IceNet?: any) => {
      let cb = "";
      if (conf.admin.includes(user)) {
        // let msg = await fish.account.liveness()
        IceNet.sendMsg("凌 活跃");
      } else {
        IceNet.sendMsg(`凌 活跃 ${user}`);
      }
      return cb;
    },
  },
  {
    rule: /补偿.{3,15}/,
    func: async (user: string, message: string, fish: FishPi, IceNet?: any) => {
      let cb = "";
      if (conf.admin.includes(user)) {
        let dataInfo = message.split(" ");
        let BCUser = dataInfo[1];
        let BCNum = dataInfo[2];
        let BCWhy = dataInfo[3];
        if (!BCUser || !BCNum || !BCWhy) {
          cb = "补偿参数错误,正确格式示例[小冰 补偿 Yui 100 理由]";
        } else {
          FingerTo(conf.keys.point).editUserPoints(
            BCUser,
            parseInt(BCNum),
            BCWhy
          );
          cb = `已补偿${BCUser}\`${BCNum}\`积分`;
        }
      } else {
        cb = `亲,这是管理的专属权限哦`;
      }
      return cb;
    },
  },
  {
    rule: /(去打劫|发工资)了?吗?$/,
    func: async (user: string, message: string, fish: FishPi, IceNet?: any) => {
      let cb = "";
      let liveness = 0;
      let isDajie = !message.match("工资");
      if (IceNet.UDetail.last_liveness == 1) {
        cb = `小冰今天已经${
          isDajie ? "打劫过" : "领过工资"
        }啦~ \n > 小冰打劫是领取昨日活跃哦, 让小冰帮你领取有概率获得免签卡碎片~`;
        return cb;
      }
      liveness = await FingerTo(conf.keys.liveness).getYesterDayLivenessReward(
        user
      );
      if (liveness == 0) {
        cb = `今日已经领过活跃啦! 不可以重复领取哦 \n > 小冰打劫是领取昨日活跃哦, 让小冰帮你领取有概率获得免签卡碎片~`;
        return cb;
      }
      cb = `小冰${isDajie ? "打劫回来" : "发工资"}啦！一共获得了${
        liveness >= 0
          ? liveness + "点积分:credit_card:"
          : "0点积分, 不要太贪心哦~"
      }`;
      let toDaySeed = parseInt((Math.random() * 100).toString());
      if (toDaySeed <= 40) {
        cb += `\n 🎉🎉🎉鸿运当头🎉🎉🎉 \n `;
        cb += `嘻嘻,小冰骗你的~小冰什么都没捡到哦`;
        cb += `\n > 发送\`小冰 背包\`可以查看当前背包信息`;
      } else if (toDaySeed <= 65) {
        cb += `\n 🎉🎉🎉鸿运当头🎉🎉🎉 \n `;
        cb += `${IceNet.UName}! ${IceNet.UName}! 小冰捡到了\`免签卡碎片\`一张,已经放入${IceNet.UName}的背包啦~`;
        cb += `\n > 发送\`小冰 背包\`可以查看当前背包信息`;
        await EidtUserBag({ item: "免签卡碎片", num: 1 }, IceNet);
      } else if (toDaySeed < 90) {
        cb += `\n ${IceNet.UName}! ${IceNet.UName}! 我在路上看到阿达了,还给我了一张签名照。`;
        await EidtUserBag({ item: "阿达的签名照", num: 1 }, IceNet);
      } else {
        cb += `\n ${IceNet.UName}! ${IceNet.UName}! 凌被妖怪抓走了(╥╯^╰╥) 快v我50去报警`;
      }
      IceNet.UDetail.last_liveness = 1;
      await IceNet.user.update(IceNet.UDetail.id, IceNet.UDetail);
      let creditUser = await IceNet.credit.find({ where: { user } });
      if (creditUser.length !== 0) {
        creditUser[0].liveness_times = (creditUser[0].liveness_times || 0) + 1;
        await IceNet.credit.update(creditUser[0].id, creditUser[0]);
      }
      return cb;
    },
  },
  {
    rule: /^背包$/,
    func: async (user: string, message: string, fish: FishPi, IceNet?: any) => {
      let cb = "";
      let uBag: UbagItem[] = JSON.parse(IceNet.UDetail.bag);
      if (uBag.length == 0) {
        cb += `\n > 你瞅了瞅你的背包, 忍不住高歌一曲`;
        cb += `\n <iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="//music.163.com/outchain/player?type=2&id=2005811997&auto=0&height=66"></iframe>`;
      } else {
        cb += `当前存货:`;
        uBag.forEach((i) => {
          if (i.num > 0) cb += `\n \`${i.name}\`*${i.num}个`;
        });
      }
      return cb;
    },
  },
  {
    rule: /^兑换 .{0,5}$/,
    func: async (user: string, message: string, fish: FishPi, IceNet?: any) => {
      let cb = "";
      let item = message.split(" ")[1];
      if (!["免签卡", "免签卡碎片"].includes(item)) {
        return `啊啊啊 小冰没有这个道具啊`;
      }
      let isOk = null;
      switch (item) {
        case "免签卡":
          isOk = await EidtUserBag({ item: "免签卡碎片", num: -3 }, IceNet);
          isOk.code == 0 &&
            (await FingerTo(conf.keys.item).editUserBag(
              user,
              "checkin1day",
              1
            ));
          cb = isOk.code == 0 ? "兑换成功" : isOk.msg;
          break;
        case "免签卡碎片":
          isOk = await EidtUserBag({ item: "阿达的签名照", num: -3 }, IceNet);
          isOk.code == 0 &&
            (await EidtUserBag({ item: "免签卡碎片", num: 1 }, IceNet));
          cb = isOk.code == 0 ? "兑换成功" : isOk.msg;
          break;
        default:
          break;
      }
      return cb;
    },
  },
  {
    rule: /(发个|来个)红包$/,
    func: async (user: string, message: string, fish: FishPi, IceNet?: any) => {
      let cb = "";
      let now = new Date().getDate();
      if (conf.admin.includes(user)) {
        // 概率暂时设置成5%吧，以后在改成次数限制
        if (now != GlobalData.RedPacketDate) {
          GlobalData.isSendRedPacket = false;
        }
        if (!GlobalData.isSendRedPacket) {
          if (Math.random() > 0.99) {
            GlobalData.isSendRedPacket = true;
            GlobalData.RedPacketDate = now;
            fish.chatroom.redpacket.send({
              type: RedPacketType.Random,
              msg: "最！后！一！个！别再剥削我了！！！！",
              money: 200,
              count: 3,
            });
            cb = "";
          } else {
            cb = `不给了！不给了！天天找我要红包，你倒是给我一个啊！`;
          }
        } else {
          cb = `今天已经发过了！你发我一个啊！`;
        }
      } else {
        if (now != GlobalData.TodayRedPacketDate) {
          GlobalData.isSendTodayRedPacket = false;
        }
        if (!GlobalData.isSendTodayRedPacket) {
          if (Math.random() > 0.99) {
            GlobalData.isSendTodayRedPacket = true;
            GlobalData.TodayRedPacketDate = now;
            fish.chatroom.redpacket.send({
              type: RedPacketType.Specify,
              msg: "偷偷发给你的哦，不要给别人说！",
              money: Math.floor(Math.random() * 32 + 32),
              count: 1,
              recivers: [user],
            });
            cb = "";
          } else {
            cb = `这件事已不必再提，皆因钱财不够`;
          }
        } else {
          cb = `:neutral_face:今天发过啦~`;
        }
      }
      return cb;
    },
  },
  {
    rule: /^等级排行(榜?)$/,
    func: async (user: string, message: string, fish: FishPi, IceNet?: any) => {
      let cb = await GetXiaoIceGameRank();
      return cb;
    },
  },
  {
    rule: /撤回\d*$/,
    func: async (user: string, message: string, fish: FishPi, IceNet?: any) => {
      let cb = "";
      if (conf.admin.includes(user)) {
        let msg = message.substr(message.indexOf("撤回") + 2).trim();
        try {
          let num = parseInt(msg);
          let deleteList = IceNet.GLOBAL_MSG_OID.splice(0, num);
          deleteList.forEach(async function (oId) {
            console.log(oId);
            await fish.chatroom.revoke(oId);
          });
          cb = `撤回完成，共计撤回${num}条消息。`;
        } catch (e) {
          cb = `撤回失败，请检查日志。`;
        }
      } else {
        cb = `暂无权限~`;
      }
      return cb;
    },
  },
  {
    rule: /(今天|明天|后天|早上|中午|晚上).{0,4}吃(啥|什么)/,
    func: async (user: string, message: string, fish: FishPi, IceNet?: any) => {
      let foodList = [
        "馄饨",
        "拉面",
        "烩面",
        "热干面",
        "刀削面",
        "油泼面",
        "炸酱面",
        "炒面",
        "重庆小面",
        "米线",
        "酸辣粉",
        "土豆粉",
        "螺狮粉",
        "凉皮儿",
        "麻辣烫",
        "肉夹馍",
        "羊肉汤",
        "炒饭",
        "盖浇饭",
        "卤肉饭",
        "烤肉饭",
        "黄焖鸡米饭",
        "驴肉火烧",
        "川菜",
        "麻辣香锅",
        "火锅",
        "酸菜鱼",
        "烤串",
        "西北风",
        "披萨",
        "烤鸭",
        "汉堡",
        "炸鸡",
        "寿司",
        "蟹黄包",
        "煎饼果子",
        "生煎",
        "炒年糕",
      ];
      let food = Math.floor(Math.random() * foodList.length);
      let cb = `不知道吃啥那就吃 [${foodList[food]}] 吧`;
      return cb;
    },
  },
  {
    rule: /^活动排行(榜?)$/,
    func: async (user: string, message: string, fish: FishPi, IceNet?: any) => {
      let cb = getActivutyRanking("年终征文2022");
      return cb;
    },
  },
  {
    rule: /.*/,
    func: async (user: string, message: string, fish: FishPi, IceNet?: any) => {
      if (Math.random() > 0.5) return await chatWithXiaoAi(message);
      return await chatWithXiaoBing(message);
    },
  },
];

async function usePoint() {
  if (GlobalData.pointList.length > 0) {
    let user = GlobalData.pointList.shift();
    await startUsePoint(user);
  }
}

async function startUsePoint(user: string) {
  try {
    await FingerTo(conf.keys.point).editUserPoints(
      user,
      -64,
      "聊天室合议禅定为应急预案,64积分已扣除"
    );
    usePoint();
  } catch (e) {
    LOGGER.Err(`扣除${user}积分失败`, e);
    return false;
  }
}

async function GetXiaoIceMsg(
  user: string,
  msg: string,
  fish: FishPi,
  IceNet?: any
) {
  if (msg.startsWith("小冰dev")) {
    if (!conf.admin.includes(user)) return "你不是管理员, 不能使用dev指令";
  }
  let message = msg.replace(/^小冰(dev)?/i, "");
  message = message.trim();
  let cb = "";
  for (let r of XiaoIceRuleList) {
    if (r.rule.test(message)) {
      LOGGER.Log(`收到${user}的指令：${message}`, 1);
      cb = await r.func(user, message, fish, IceNet);
      break;
    }
  }
  return cb;
}

async function EidtUserBag(data: any, IceNet?: any) {
  let uBag: UbagItem[] = JSON.parse(IceNet.UDetail.bag);
  let cb = { code: 0, msg: "成功" };
  if (uBag.length == 0) {
    if (data.num < 0) {
      return { code: 1, msg: "你还没有该物品" };
    }
    uBag.push({ name: data.item, num: data.num });
  } else {
    let hasItem: boolean = false;
    uBag.forEach((i) => {
      if (i.name == data.item) {
        hasItem = true;
        if (i.num + data.num < 0) {
          cb = { code: 1, msg: "物品数量不足" };
        } else {
          i.num += data.num;
          cb = { code: 0, msg: "成功" };
        }
      }
    });
    if (!hasItem) {
      if (data.num < 0) return { code: 1, msg: "你还没有该物品" };
      uBag.push({ name: data.item, num: data.num });
    }
  }
  IceNet.UDetail.bag = JSON.stringify(uBag);
  await IceNet.user.update(IceNet.UDetail.id, IceNet.UDetail);
  return cb;
}
