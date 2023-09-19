import * as dayjs from "dayjs";
import { ChatMsg, RuleParams } from "src/types";
import { LOGGER } from "../logger";
import { ActivityRecordEntity } from "src/entities/activity.entities";
import FishPi, { FingerTo } from "fishpi";

export const activityRuleList = [
  {
    rule: /^国庆快乐$/,
    func: async ({ data, IceNet, conf, fish }: RuleParams) => {
      let cb = await activityReward(data, IceNet, 1, 7, conf, fish);
      return cb;
    },
  },
  {
    rule: /^中秋快乐$/,
    func: async ({ data, IceNet, conf, fish }: RuleParams) => {
      let cb = await activityReward(data, IceNet, 1, 3, conf, fish);
      return cb;
    },
  },
  {
    rule: /^欢庆双节$/,
    func: async ({ data, IceNet, conf, fish }: RuleParams) => {
      let cb = await activityReward(data, IceNet, 1, 8, conf, fish);
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
  let cb = `:tada:恭喜触发\`关键词${activityId}\` 奖励已到账,可在账户中查看~`;
  if (dayjs().isBefore("2023-09-27")) {
    cb = "活动还没有开始哦~";
    return cb;
  }
  let Auser = await IceNet.activityRecord.findOne({
    where: { userId: IceNet.UDetail.uId },
  });
  if (Auser) {
    cb = `:jack_o_lantern:已经领取过啦,不可以重复领取哦`;
    return cb;
  }
  let activity_record = new ActivityRecordEntity();
  activity_record.userId = IceNet.UDetail.uId;
  activity_record.activityName = "2023国庆活动";
  activity_record.name = data.user;
  activity_record.content = data.msg;
  IceNet.activityRecord.save(activity_record);
  await fish.chatroom.revoke(data.oId);
  FingerTo(conf.keys.item).editUserBag(data.user, "sysCheckinRemain", day);
  cb = `:tada:恭喜触发\`关键词1\` 奖励已到账,可在账户中查看~`;
  return cb;
}
