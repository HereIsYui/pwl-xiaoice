import { FingerTo } from 'fishpi'
import { editUserBag } from './bag'
import * as dayjs from 'dayjs'
import { Bank } from 'src/entities/bank.entities'
import { BankRecords } from 'src/entities/bankrecord.entities'
import { type RuleParams } from 'src/types'

export const bankRuleList = [
  {
    rule: /银行(帮助|说明)?/,
    func: async () => {
      const cb = '\n ![IceBank](https://file.fishpi.cn/2023/05/image-c00afb3d.png) \n 当当当当,这里是IceBank \n - 存款请发专属红包并备注`存款`或直接转账或发送指令 [小冰 存款 金额] \n - 取款请发送指令 [小冰 取款 金额]'
      return cb
    }
  },
  {
    rule: /账户$/,
    func: async ({ user, IceNet }: RuleParams) => {
      const uBank = await IceNet.bank.findOne({ where: { user } })
      let cb = ''
      if (uBank && uBank.id) {
        cb = `\n【IceBank:credit_card:】${
          uBank.point > 1000000
            ? '钻石SVIP'
            : uBank.point > 200000
            ? '铂金VIP'
            : ''
        }储户信息: \n 卡号: ${uBank.bank_id} \n 余额: ${uBank.point}积分`
        if (uBank.point > 100000) {
          cb += ' \n > 个,十,百,千,万,爸爸,爷爷,祖宗,(¯﹃¯)'
        } else {
          cb += ' \n > 存款达到20w可以定制卡号哦'
        }
      } else {
        cb = '你还没有开户哦:credit_card: \n > 给小冰发专属红包开户并备注`存款`不备注的算赠与哦'
      }
      return cb
    }
  },
  {
    rule: /存款? \d{0,9}$/,
    func: cun
  },
  {
    rule: /取款? \d{0,9}$/,
    func: qu
  },
  {
    rule: /(去打劫|发工资)了?吗?$/,
    func: daJie
  },
  {
    rule: /补偿.{3,15}/,
    func: async ({ user, msg, conf }: RuleParams) => {
      let cb = ''
      if (conf.admin.includes(user)) {
        const dataInfo = msg.split(' ')
        const BCUser = dataInfo[1]
        const BCNum = dataInfo[2]
        const BCWhy = dataInfo[3]
        if (!BCUser || !BCNum || !BCWhy) {
          cb = '补偿参数错误,正确格式示例[小冰 补偿 Yui 100 理由]'
        } else {
          FingerTo(conf.keys.point).editUserPoints(
            BCUser,
            parseInt(BCNum),
            BCWhy
          )
          cb = `已补偿${BCUser}\`${BCNum}\`积分`
        }
      } else {
        cb = '亲,这是管理的专属权限哦'
      }
      return cb
    }
  }
]

async function daJie ({ user, msg, IceNet, conf }: RuleParams) {
  let cb = ''
  let liveness = 0
  const isDajie = !msg.match('工资')
  if (IceNet.UDetail.last_liveness == 1) {
    cb = `小冰今天已经${
      isDajie ? '打劫过' : '领过工资'
    }啦~ \n > 小冰打劫是领取昨日活跃哦, 让小冰帮你领取有概率获得免签卡碎片~`
    return cb
  }
  liveness = await FingerTo(conf.keys.liveness).getYesterDayLivenessReward(
    user
  )
  if (liveness == 0) {
    cb = '今日已经领过活跃啦! 不可以重复领取哦 \n > 小冰打劫是领取昨日活跃哦, 让小冰帮你领取有概率获得免签卡碎片~'
    return cb
  }
  cb = `小冰${isDajie ? '打劫回来' : '发工资'}啦！一共获得了${
    liveness >= 0 ? liveness + '点积分:credit_card:' : '0点积分, 不要太贪心哦~'
  }`
  const toDaySeed = parseInt((Math.random() * 100).toString())
  if (toDaySeed <= 40) {
    cb += '\n 🎉🎉🎉鸿运当头🎉🎉🎉 \n '
    cb += '嘻嘻,小冰骗你的~小冰什么都没捡到哦'
    cb += '\n > 发送`小冰 背包`可以查看当前背包信息'
  } else if (toDaySeed <= 65) {
    cb += '\n 🎉🎉🎉鸿运当头🎉🎉🎉 \n '
    cb += `${IceNet.UName}! ${IceNet.UName}! 小冰捡到了\`免签卡碎片\`一张,已经放入${IceNet.UName}的背包啦~`
    cb += '\n > 发送`小冰 背包`可以查看当前背包信息'
    await editUserBag({ item: '免签卡碎片', num: 1 }, IceNet)
  } else if (toDaySeed < 90) {
    cb += `\n ${IceNet.UName}! ${IceNet.UName}! 我在路上看到阿达了,还给我了一张签名照。`
    await editUserBag({ item: '阿达的签名照', num: 1 }, IceNet)
  } else {
    cb += `\n ${IceNet.UName}! ${IceNet.UName}! 凌被妖怪抓走了(╥╯^╰╥) 快v我50去报警`
  }
  IceNet.UDetail.last_liveness = 1
  await IceNet.user.update(IceNet.UDetail.id, IceNet.UDetail)
  const creditUser = await IceNet.credit.find({ where: { user } })
  if (creditUser.length !== 0) {
    creditUser[0].liveness_times = (creditUser[0].liveness_times || 0) + 1
    await IceNet.credit.update(creditUser[0].id, creditUser[0])
  }
  return cb
}

async function cun ({ user, msg, fish, IceNet, conf }: RuleParams) {
  const pointNum = Math.abs(parseInt(msg.split(' ')[1] || '0'))
  let cb = ''
  if (pointNum <= 100000000 && pointNum > 0) {
    const userDetail = await fish.user(user)
    const userPoint = userDetail.userPoint
    const OrderId = 'IceBank-' + dayjs().format('YYYYMMDDHHmmssSSS')
    if (userPoint > pointNum) {
      await FingerTo(conf.keys.point).editUserPoints(
        user,
        -pointNum,
        `IceBank-聊天室${user}存款${pointNum}积分`
      )
      await FingerTo(conf.keys.point).editUserPoints(
        'xiaoIce',
        pointNum,
        `IceBank-聊天室${user}存款${pointNum}积分`
      )
      const uBank: Bank = await IceNet.bank.findOne({ where: { user } })
      const uRecord = new BankRecords()
      uRecord.order_id = OrderId
      uRecord.user = user
      uRecord.data_id = dayjs().valueOf().toString()
      uRecord.point = pointNum.toString()
      uRecord.access = 0
      uRecord.access_type = 3
      if (uBank && uBank.id) {
        uRecord.balance = (parseInt(uBank.point) + pointNum).toString()
        uRecord.is_success = 1
        await IceNet.bankRecords.save(uRecord)
        uBank.point = (parseInt(uBank.point) + pointNum).toString()
        await IceNet.bank.update(uBank.id, uBank)
        cb = `【IceBank-交易通知】交易积分:${pointNum} \n 交易方式:存 \n 余额:${uBank.point} \n 交易单号:${OrderId}`
      } else {
        const newUser = new Bank()
        newUser.uId = IceNet.UDetail.uId
        newUser.user = user
        newUser.point = pointNum.toString()
        newUser.bank_id = 'ICE' + new Date().getTime().toString()
        await IceNet.bank.save(newUser)
        uRecord.uId = IceNet.UDetail.uId
        uRecord.balance = '0'
        uRecord.is_success = 1
        await IceNet.bankRecords.save(uRecord)
        IceNet.sendMsg(
          `@${user} ,【IceBank-开户成功通知】:交易积分:${pointNum} \n 交易方式:存 \n 交易单号:${OrderId} \n 卡号:${newUser.bank_id}`
        )
      }
    } else {
      cb = `【IceBank-交易失败通知】交易积分:${pointNum} \n 交易方式:存 \n 失败原因:你的余额不足 \n 交易单号:${OrderId}`
    }
  } else {
    cb = '【IceBank-交易失败通知】单次存取不得大于10w,不得小于0'
  }
  return cb
}

async function qu ({ user, msg, fish, IceNet }: RuleParams) {
  const pointNum = Math.abs(parseInt(msg.split(' ')[1] || '0'))
  let cb = ''
  if (pointNum > 0 && pointNum < 100000000) {
    const uBank: Bank = await IceNet.bank.findOne({ where: { user } })
    const OrderId = 'IceBank-' + dayjs().format('YYYYMMDDHHmmssSSS')
    if (uBank && uBank.id) {
      if (parseInt(uBank.point) > pointNum) {
        const uRecord = new BankRecords()
        uRecord.order_id = OrderId
        uRecord.user = user
        uRecord.data_id = dayjs().valueOf().toString()
        uRecord.point = pointNum.toString()
        uRecord.access = 1
        uRecord.access_type = 0
        uRecord.is_success = 1
        uRecord.uId = uBank.uId
        uRecord.balance = (parseInt(uBank.point) - pointNum).toString()
        uBank.point = (parseInt(uBank.point) - pointNum).toString()
        await IceNet.bank.update(uBank.id, uBank)
        await IceNet.bankRecords.save(uRecord)
        await fish.account.transfer(
          user,
          pointNum,
          `小冰银行取款${pointNum}积分`
        )
        cb = `【IceBank-交易通知】交易积分:${pointNum} \n 交易方式:取 \n 本次取款将通过转账方式到账,请注意查收 \n 余额:${uBank.point} \n 交易单号:${OrderId}`
      } else {
        cb = `【IceBank-交易失败通知】交易积分:${pointNum} \n 交易方式:取 \n 失败原因:你的余额不足 \n 交易单号:${OrderId}`
      }
    } else {
      cb = '你还没有开户哦:credit_card: \n > 给小冰发专属红包开户并备注`存款`不备注的算赠与哦'
    }
  } else {
    cb = '指令错误 取款指令示例[小冰 取款 100] \n > 取款最低1积分,最高10w积分'
  }
  return cb
}
