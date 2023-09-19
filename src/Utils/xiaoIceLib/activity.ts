import * as dayjs from 'dayjs'
import { type RuleParams } from 'src/types'
import { LOGGER } from '../logger'
import { ActivityRecordEntity } from 'src/entities/activity.entities';
import FishPi, { FingerTo } from 'fishpi';

export const activityRuleList = [
  {
    rule: /^国庆快乐$/,
    func: async ({ user, msg, IceNet, conf }: RuleParams) => {
      let cb = await activityReward(user, msg, IceNet, 1, 7, conf);
      return cb
    }
  },
  {
    rule: /^中秋快乐$/,
    func: async ({ user, msg, IceNet, conf }: RuleParams) => {
      let cb = await activityReward(user, msg, IceNet, 1, 3, conf);
      return cb
    }
  },
  {
    rule: /^欢庆双节$/,
    func: async ({ user, msg, IceNet, conf }: RuleParams) => {
      let cb = await activityReward(user, msg, IceNet, 1, 8, conf);
      return cb
    }
  }
]


async function activityReward(user: string, msg: string, IceNet: any, activityId: number, day: number, conf: any) {
  let cb = `:tada:恭喜触发\`关键词${activityId}\` 奖励已到账,可在账户中查看~`;
  if (dayjs().isBefore('2023-09-27')) {
    cb = "活动还没有开始哦~"
    return cb
  }  
  let Auser = await IceNet.activityRecord.findOne({ where: { userId: IceNet.UDetail.uId } });
  if (Auser) {
    cb = `:jack_o_lantern:已经领取过啦,不可以重复领取哦`;
  } else {
    let activity_record = new ActivityRecordEntity();
    activity_record.userId = IceNet.UDetail.uId;
    activity_record.activityName = '2023国庆活动';
    activity_record.name = user;
    activity_record.content = msg;
    IceNet.activityRecord.save(activity_record);
    FingerTo(conf.keys.item).editUserBag(user, 'sysCheckinRemain', day);
    cb = `:tada:恭喜触发\`关键词1\` 奖励已到账,可在账户中查看~`;
  }
  return cb
}