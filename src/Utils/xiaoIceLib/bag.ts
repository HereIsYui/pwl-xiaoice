import FishPi, { FingerTo } from 'fishpi'
import { type RuleParams, type UBagItem } from '../../types'
export const bagRuleList = [
  {
    rule: /^背包$/,
    func: async ({ IceNet }: RuleParams) => {
      let cb = ''
      const uBag: UBagItem[] = JSON.parse(IceNet.UDetail.bag)
      if (uBag.length == 0) {
        cb += '\n > 你瞅了瞅你的背包, 忍不住高歌一曲'
        cb += '\n <iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="//music.163.com/outchain/player?type=2&id=2005811997&auto=0&height=66"></iframe>'
      } else {
        cb += '当前存货:'
        uBag.forEach((i) => {
          if (i.num > 0) cb += `\n \`${i.name}\`*${i.num}个`
        })
      }
      return cb
    }
  },
  {
    rule: /^兑换 .{0,5}$/,
    func: async ({ user, msg, IceNet, conf }: RuleParams) => {
      let cb = ''
      const item = msg.split(' ')[1]
      if (!['免签卡', '免签卡碎片'].includes(item)) {
        return '啊啊啊 小冰没有这个道具啊'
      }
      let isOk = null
      switch (item) {
        case '免签卡':
          isOk = await editUserBag({ item: '免签卡碎片', num: -3 }, IceNet)
          isOk.code == 0 &&
            (await FingerTo(conf.keys.item).editUserBag(
              user,
              'checkin1day',
              1
            ))
          cb = isOk.code == 0 ? '兑换成功' : isOk.msg
          break
        case '免签卡碎片':
          isOk = await editUserBag({ item: '阿达的签名照', num: -3 }, IceNet)
          isOk.code == 0 &&
            (await editUserBag({ item: '免签卡碎片', num: 1 }, IceNet))
          cb = isOk.code == 0 ? '兑换成功' : isOk.msg
          break
        default:
          break
      }
      return cb
    }
  }
]

export async function editUserBag (data: any, IceNet?: any) {
  const uBag: UBagItem[] = JSON.parse(IceNet.UDetail.bag)
  let cb = { code: 0, msg: '成功' }
  if (uBag.length == 0) {
    if (data.num < 0) {
      return { code: 1, msg: '你还没有该物品' }
    }
    uBag.push({ name: data.item, num: data.num })
  } else {
    let hasItem: boolean = false
    uBag.forEach((i) => {
      if (i.name == data.item) {
        hasItem = true
        if (i.num + data.num < 0) {
          cb = { code: 1, msg: '物品数量不足' }
        } else {
          i.num += data.num
          cb = { code: 0, msg: '成功' }
        }
      }
    })
    if (!hasItem) {
      if (data.num < 0) return { code: 1, msg: '你还没有该物品' }
      uBag.push({ name: data.item, num: data.num })
    }
  }
  IceNet.UDetail.bag = JSON.stringify(uBag)
  await IceNet.user.update(IceNet.UDetail.id, IceNet.UDetail)
  return cb
}
