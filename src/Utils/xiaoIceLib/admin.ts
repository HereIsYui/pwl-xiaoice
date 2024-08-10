import * as dayjs from "dayjs";
import { type RuleParams } from "src/types";
import { LOGGER } from "../logger";
import { setAdmin } from "./function";

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
];
