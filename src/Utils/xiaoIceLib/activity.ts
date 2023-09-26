import * as dayjs from "dayjs";
import { ChatMsg, RuleParams } from "src/types";
import { LOGGER } from "../logger";
import { ActivityRecordEntity } from "src/entities/activity.entities";
import FishPi, { FingerTo } from "fishpi";

export const activityRuleList = [
  {
    rule: /[\u4E00-\u9FA5]{1,20}(国庆).{0,10}(快乐)/,
    func: async ({ data, IceNet, conf, fish }: RuleParams) => {
      let RandomDay = randomNum(2, 6);
      let cb = await activityReward(data, IceNet, 1, 8 + RandomDay, conf, fish);
      return cb;
    },
  },
  {
    rule: /[\u4E00-\u9FA5]{1,20}(中秋).{0,10}(快乐)/,
    func: async ({ data, IceNet, conf, fish }: RuleParams) => {
      let RandomDay = randomNum(1, 3);
      let cb = await activityReward(data, IceNet, 1, 8 + RandomDay, conf, fish);
      return cb;
    },
  },
  {
    rule: /欢庆双节/,
    func: async ({ data, IceNet, conf, fish }: RuleParams) => {
      let RandomDay = randomNum(2, 6);
      let cb = await activityReward(data, IceNet, 1, 10 + RandomDay, conf, fish);
      return cb;
    },
  },
];

async function activityReward(
  data: ChatMsg,
  IceNet: any,
  activityId: number,
  day: number,
  conf: any,
  fish: any
) {
  let cb = ``;
  if (dayjs().isBefore("2023-09-26") || dayjs().isAfter("2023-10-06")) {
    cb = "活动未开始或已结束~";
    return cb;
  }
  // 先撤回口令
  await fish.chatroom.revoke(data.oId);

  // 判断是否已经领取过
  let Auser = await IceNet.activityRecord.findOne({
    where: { userId: data.uId },
  });
  if (Auser) {
    cb = `:jack_o_lantern:已经领取过啦,不可以重复领取哦`;
    return cb;
  }
  // 口令查重
  let isRepeat = await IceNet.activityRecord.findOne({
    where: { content: data.msg },
  });
  if (isRepeat) {
    return `:jack_o_lantern: 该口令已经被使用过啦~`;
  }

  let activity_record = new ActivityRecordEntity();
  activity_record.userId = data.uId;
  activity_record.activityName = "2023国庆活动";
  activity_record.name = data.user;
  activity_record.content = data.msg;
  IceNet.activityRecord.save(activity_record);
  console.log('day:' + day);
  FingerTo(conf.keys.item).editUserBag(data.user, "sysCheckinRemain", day);
  cb = `:tada:恭喜触发\`关键词${activityId}\` 奖励已到账,可在账户中查看~`;
  return cb;
}

// 根据传入的最大值最小值生成随机数
function randomNum(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}