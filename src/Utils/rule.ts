import {
  music163,
  EmptyCall,
  GetXiaoIceGameRank,
  getActivutyRanking,
  chatWithXiaoAi,
  chatWithXiaoBing,
  getTianqi,
} from "./xiaoIceLib/function";
import type FishPi from "fishpi";
import { LOGGER } from "./logger";
import { type RuleParams } from "../types";
import { bankRuleList } from "./xiaoIceLib/bank";
import { bagRuleList } from "./xiaoIceLib/bag";
import { gameRuleList } from "./xiaoIceLib/game";
import { adminRuleList } from "./xiaoIceLib/admin";
import { wordRuleList } from "./xiaoIceLib/words";

export const GlobalRuleList = [
  ...adminRuleList,
  ...gameRuleList,
  {
    rule: /^点歌/,
    func: async ({ user, msg, fish, IceNet }: RuleParams) => {
      let cb = "\n > 滴~ 你点的歌来了 ";
      cb += await music163({ msg });
      return cb;
    },
  },
  {
    rule: /(56c0f695|乌拉)/,
    func: async ({ user, msg, fish, IceNet }: RuleParams) => {
      const cb = "";
      // if (user != 'sevenSummer') {
      //   cb = "![乌拉乌拉](https://pwl.stackoverflow.wiki/2022/03/image-56c0f695.png)";
      // }
      return cb;
    },
  },
  {
    rule: /^TTS|^朗读/i,
    func: async ({ user, msg, fish, IceNet }: RuleParams) => {
      const link =
        Buffer.from(
          "aHR0cHM6Ly9kaWN0LnlvdWRhby5jb20vZGljdHZvaWNlP2xlPXpoJmF1ZGlvPQ==",
          "base64"
        ) + encodeURIComponent(msg.replace(/^TTS|^朗读/i, ""));
      const cb = `那你可就听好了<br><audio src='${link}' controls/>`;
      return cb;
    },
  },
  {
    rule: /^小冰(dev)?/,
    func: async ({ user, msg, fish, IceNet, conf }: RuleParams) => {
      const cb = await GetXiaoIceMsg(user, msg, fish, IceNet, conf);
      return cb;
    },
  },
];

const XiaoIceRuleList = [
  ...bagRuleList,
  ...bankRuleList,
  ...wordRuleList,
  {
    rule: /^\s*$/,
    func: async ({ user, msg, fish, IceNet, conf }: RuleParams) => {
      let cb = "";
      if (Math.random() > 0.2) {
        cb = EmptyCall(user);
      }
      return cb;
    },
  },
  {
    rule: /^(菜单|功能)(列表)?$/,
    func: async ({ user, msg, fish, IceNet, conf }: RuleParams) => {
      const cb =
        "功能列表:\n	1. 直接发短语即可聊天。\n2. 全局发送[TTS+文本]或[朗读+文本]即可朗读(无需关键词)\n3. 回复[xxx天气]可以查询天气";
      return cb;
    },
  },
  {
    rule: /我是谁|叫我什么/,
    func: async ({ user, msg, fish, IceNet, conf }: RuleParams) => {
      const cb = `当然是: ${IceNet.UName}啦:blush:  \n > 注意 首次命名免费, 之后每次改名消耗50亲密度`;
      return cb;
    },
  },
  {
    rule: /叫我\w{0,5}/,
    func: async ({ user, msg, fish, IceNet, conf }: RuleParams) => {
      let uwantName = msg.substring(2).trim();
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
        if (IceNet.UDetail.user == "xiong" && uwantName.includes("帅哥")) {
          uwantName = "衰哥";
        }
        cb = `好的~以后我就叫你${uwantName}啦:stuck_out_tongue_winking_eye: \n > 注意 首次命名免费, 之后每次改名消耗50亲密度`;
        const nUser = IceNet.UDetail;
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
    func: async ({ user, msg, fish, IceNet, conf }: RuleParams) => {
      const cb = `当前亲密度为: ${IceNet.UDetail.intimacy}:two_hearts: \n > 召唤小冰,送鱼丸鱼翅,红包都可以增加亲密度哦`;
      return cb;
    },
  },
  {
    rule: /信用分/,
    func: async ({ user, msg, fish, IceNet, conf }: RuleParams) => {
      const Info = await IceNet.credit.find({ where: { user } });
      let cb = "";
      if (Info.length !== 0) {
        const IceScore =
          Info[0].base_score +
          Info[0].activity_score +
          Info[0].reward_score +
          Info[0].credit_score;
        cb = `当前信用分为: ${IceScore}:star2:
 - 基础分: ${Info[0].base_score} '分值构成: 注册时长最高+120分, 小冰亲密度最高+80分'
 - 活跃分: ${Info[0].activity_score} '分值构成: 本周周跃情况最高+200分'
 - 奖励分: ${Info[0].reward_score} '分值构成: 每天找小冰打劫最高+70分, 每天发红包最高+130分'
 - 赌狗分: ${Info[0].credit_score} '分值构成: 基础100分, 按赌狗红包输赢和次数加减'
 > 信用分每天更新,每周重置`;
      } else {
        cb = "暂无信用记录 \n > 小冰亲密度达到10以上, 第二天才会计算信用分哦";
      }
      return cb;
    },
  },
  {
    rule: /^我是(姐姐|哥哥)/,
    func: async ({ user, msg, fish, IceNet, conf }: RuleParams) => {
      const gender = msg.includes("哥哥") ? 1 : 0;
      const nUser = IceNet.UDetail;
      nUser.gender = gender;
      IceNet.user.update(nUser.id, nUser);
      const cb = "好的,已修正性别:smiling_imp:";
      return cb;
    },
  },
  {
    rule: /\w*天气/,
    func: async ({ user, msg, fish, IceNet, conf }: RuleParams) => {
      const cb = await getTianqi(user, msg, IceNet);
      return cb;
    },
  },
  {
    rule: /(当前|现在|今日|水多)(吗|少了)?(活跃)?值?$/,
    func: async ({ user, msg, fish, IceNet, conf }: RuleParams) => {
      const cb = "";
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
    rule: /^等级排行(榜?)$/,
    func: async ({ user, msg, fish, IceNet, conf }: RuleParams) => {
      const cb = GetXiaoIceGameRank();
      return cb;
    },
  },
  {
    rule: /撤回\d*$/,
    func: async ({ user, msg, fish, IceNet, conf }: RuleParams) => {
      let cb = "";
      if (conf.admin.includes(user)) {
        msg = msg.replace(/^撤回/, "").trim();
        try {
          const num = parseInt(msg);
          const deleteList = IceNet.GLOBAL_MSG_OID.splice(0, num);
          deleteList.forEach(async function (oId) {
            console.log(oId);
            await fish.chatroom.revoke(oId);
          });
          cb = `撤回完成，共计撤回${num}条消息。`;
        } catch (e) {
          cb = "撤回失败，请检查日志。";
        }
      } else {
        cb = "暂无权限~";
      }
      return cb;
    },
  },
  {
    rule: /^活动排行(榜?)$/,
    func: async ({ user, msg, fish, IceNet, conf }: RuleParams) => {
      const cb = getActivutyRanking("年终征文2022");
      return cb;
    },
  },
  {
    rule: /.*/,
    func: async ({ user, msg, fish, IceNet, conf }: RuleParams) => {
      if (Math.random() > 0.5) return await chatWithXiaoAi(msg);
      return await chatWithXiaoBing(msg);
    },
  },
];

async function GetXiaoIceMsg(
  user: string,
  msg: string,
  fish: FishPi,
  IceNet?: any,
  conf?: any
) {
  if (msg.startsWith("小冰dev")) {
    if (!conf.admin.includes(user)) return "你不是管理员, 不能使用dev指令";
  }
  msg = msg.replace(/^小冰(dev)?/i, "").trim();
  let cb = "";
  for (const r of XiaoIceRuleList) {
    if (r.rule.test(msg)) {
      LOGGER.Log(`收到${user}的指令：${msg}`, 1);
      cb = await r.func({ user, msg, fish, IceNet, conf });
      break;
    }
  }
  return cb;
}
