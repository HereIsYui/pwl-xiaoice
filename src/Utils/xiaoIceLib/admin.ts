import * as dayjs from "dayjs";
import { type RuleParams } from "src/types";
import { LOGGER } from "../logger";
import { setAdmin } from "./function";
import axios from "axios";

export const adminRuleList = [
  {
    rule: /@xiaoIce\s+你的连接被管理员断开，请重新连接。/,
    func: async ({ user, fish, conf }: RuleParams) => {
      const cb = "";
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
    func: async ({ user, fish, conf }: RuleParams) => {
      const cb = "";
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
    func: async ({ user, msg }: RuleParams) => {
      const cb = await setAdmin(user, msg);
      return cb;
    },
  },
  {
    rule: /^微信群$/,
    func: async () => {
      const cb = "它消失了";
      return cb;
    },
  },
  {
    rule: /冰启凌/,
    func: async ({ user, msg, conf }: RuleParams) => {
      let cb = "";
      if (conf.admin.includes(user)) {
        axios({
          url: "https://chat.elves.online/super/reload",
          method: "post",
          headers: { "Content-Type": "application/json" },
          data: { s: conf.robot.sevenSummer },
        });
        cb = "咦,凌不见了?我去找找~";
      } else {
        cb = "亲,这是管理的专属权限哦";
      }
      return cb;
    },
  },
  {
    rule: /冰启鸽/,
    func: async ({ user, msg, conf }: RuleParams) => {
      let cb = "";
      if (conf.admin.includes(user)) {
        axios({
          url: "https://red.iwpz.net/restart",
          method: "post",
          headers: { "Content-Type": "application/json" },
          data: { s: conf.robot.b },
        });
        cb = "已经按了鸽鸽的开机键了~";
      } else {
        cb = "亲,这是管理的专属权限哦";
      }
      return cb;
    },
  },
];
