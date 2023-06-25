import { FingerTo, RedPacketType } from 'fishpi'
import { type RuleParams } from 'src/types'
import { LOGGER } from '../logger'

const GlobalData = {
  pointList: [],
  benbenArray: [],
  benbenTimeout: null,
  lastbenbenTime: 0,
  RedPacketDate: 0,
  isSendRedPacket: false,
  TodayRedPacketDate: 0,
  isSendTodayRedPacket: false,
  oIdList: []
}

export const gameRuleList = [
  {
    rule: /^禅定 \d+/,
    func: async ({ user, msg, fish, IceNet }: RuleParams) => {
      const cb = '禅定功能修复中~'
      return cb
    }
  },
  {
    rule: /^强行禅定/,
    func: async ({ user, msg, fish, IceNet, conf }: RuleParams) => {
      const str = msg.split(' ')
      let cb = ''
      let usr = str[1]
      if (!usr || usr == 'xiaoIce' || usr == 'Yui' || usr == 'sevenSummer') {
        usr = user
      }
      const rt = parseInt(str[2]) || 10
      if (conf.admin.includes(user)) {
        if (rt) {
          cb = `zf jy ${usr} ${rt}`
        } else {
          cb =
            '时间参数错误，请发送[强行禅定 用户 时长(分钟)]如：[禅定 Yui 10]'
        }
      } else {
        cb = 'ohhhh~你没得权限呐，骚年'
      }
      return cb
    }
  },
  {
    rule: /^破戒 .{0,20}/,
    func: async ({ user, msg, fish, IceNet, conf }: RuleParams) => {
      const str = msg.split(' ')
      let cb = ''
      const usr = str[1]
      if (conf.admin.includes(user)) {
        cb = `zf jy ${usr} 0`
      } else {
        cb = 'ohhhh~你没得权限呐，骚年'
      }
      return cb
    }
  },
  {
    rule: /(发个|来个)红包$/,
    func: async ({ user, msg, fish, IceNet, conf }: RuleParams) => {
      let cb = ''
      const now = new Date().getDate()
      if (conf.admin.includes(user)) {
        // 概率暂时设置成5%吧，以后在改成次数限制
        if (now != GlobalData.RedPacketDate) {
          GlobalData.isSendRedPacket = false
        }
        if (!GlobalData.isSendRedPacket) {
          if (Math.random() > 0.99) {
            GlobalData.isSendRedPacket = true
            GlobalData.RedPacketDate = now
            fish.chatroom.redpacket.send({
              type: RedPacketType.Random,
              msg: '最！后！一！个！别再剥削我了！！！！',
              money: 200,
              count: 3
            })
            cb = ''
          } else {
            cb = '不给了！不给了！天天找我要红包，你倒是给我一个啊！'
          }
        } else {
          cb = '今天已经发过了！你发我一个啊！'
        }
      } else {
        if (now != GlobalData.TodayRedPacketDate) {
          GlobalData.isSendTodayRedPacket = false
        }
        if (!GlobalData.isSendTodayRedPacket) {
          if (Math.random() > 0.99) {
            GlobalData.isSendTodayRedPacket = true
            GlobalData.TodayRedPacketDate = now
            fish.chatroom.redpacket.send({
              type: RedPacketType.Specify,
              msg: '偷偷发给你的哦，不要给别人说！',
              money: Math.floor(Math.random() * 32 + 32),
              count: 1,
              recivers: [user]
            })
            cb = ''
          } else {
            cb = '这件事已不必再提，皆因钱财不够'
          }
        } else {
          cb = ':neutral_face:今天发过啦~'
        }
      }
      return cb
    }
  },
  {
    rule: /^合议禅定 .{0,20}/,
    func: async ({ user, msg, fish, IceNet, conf }: RuleParams) => {
      const cb = ''
      GlobalData.pointList.push(user)
      usePoint(conf)
      return cb
    }
  },
  {
    rule: /^请崖主回山/,
    func: async ({ user, msg, fish, IceNet }: RuleParams) => {
      let cb = ''
      if (new Date().getTime() - GlobalData.lastbenbenTime > 5 * 60 * 1000) {
        if (!GlobalData.benbenArray.includes(user)) {
          clearTimeout(GlobalData.benbenTimeout)
          GlobalData.benbenArray.push(user)
          cb = `已收到，目前已收到[${GlobalData.benbenArray.length}]人的请求，15s内无人请将结算`
          GlobalData.benbenTimeout = setTimeout(() => {
            const NPeople = GlobalData.benbenArray.length
            let m = Math.round((NPeople * 30) / 60)
            if (m < 1) {
              m = 1
            }
            if (m > 3) {
              m = 6
            }
            if (NPeople < 3) {
              IceNet.sendMsg('风流：就这点人请我回去？你们什么档次？')
              GlobalData.benbenArray = []
            } else {
              IceNet.sendMsg(
                `开始结算，共计${NPeople}人请崖主，崖主回山${m}分钟`
              )
              cb = `zf jy dissoluteFate ${m}`
              GlobalData.lastbenbenTime = new Date().getTime()
              GlobalData.benbenArray = []
              IceNet.sendMsg(cb)
            }
          }, 15 * 1000)
        } else {
          cb = '你已经投票过了！'
        }
      } else {
        cb = '风流还在复活ing~'
      }
      return cb
    }
  }
]

async function usePoint (conf) {
  if (GlobalData.pointList.length > 0) {
    const user = GlobalData.pointList.shift()
    await startUsePoint(user, conf)
  }
}

async function startUsePoint (user: string, conf) {
  try {
    await FingerTo(conf.keys.point).editUserPoints(
      user,
      -64,
      '聊天室合议禅定为应急预案,64积分已扣除'
    )
    usePoint(conf)
  } catch (e) {
    LOGGER.Err(`扣除${user}积分失败`, e)
    return false
  }
}
