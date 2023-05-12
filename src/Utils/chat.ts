import type FishPi from 'fishpi'
import type { ChatMsg } from './type'
import { GlobalRuleList } from './rule'

export const ChatCallBack = async function (fish: FishPi, data: ChatMsg, IceNet?: any) {
  let uname = data.user;
  if (data.detail && data.detail.intimacy < 100) {
    uname = data.user;
  } else if (data.detail && data.detail.intimacy < 500) {
    uname = data.detail ? (data.detail.gender == '1' ? '哥哥' : '姐姐') : data.user
  } else {
    uname = data.detail ? (data.detail.nick_name ? data.detail.nick_name : (data.detail.gender == '1' ? '哥哥' : '姐姐')) : data.user
  }
  switch (data.type) {
    case 0:
      // 普通消息处理
      for (let r of GlobalRuleList) {
        if (r.rule.test(data.msg)) {
          IceNet.UDetail = data.detail;
          IceNet.UName = uname;
          let callback = await r.func(data.user, data.msg, fish, IceNet);
          if (callback) {
            IceNet.sendMsg(`@${data.user} \n ${uname} ${callback}`)
          }
          break;
        }
      }
      break;
    case 1:
      // 专属红包消息处理
      IceNet.sendMsg(`@${data.user} 谢谢${uname}送的红包:heartbeat:`);
      break
    case 2:
      // 私信消息处理
      fish.chat.send(data.user, `🥪Hi\n这里是小冰机器人!\n私聊的消息小冰暂时不做处理哦~\n如有事请联系小冰管理员:<a href="https://fishpi.cn/chat?toUser=Yui" target="_blank">Yui</a>`);
      break;
    case 3:
      // 凌 礼物处理
      let gift = JSON.parse(data.msg);
      if (gift.giftNum <= 0) {
        IceNet.sendMsg(`@${data.user} 小气鬼${uname},一个${gift.giftName}都不给我,小冰亲密度${gift.intimacy}`);
      } else if (gift.giftNum <= 5) {
        IceNet.sendMsg(`@${data.user} 谢谢小气鬼${uname}送的${gift.giftNum}个${gift.giftName},小冰亲密度+${gift.intimacy}`);
      } else {
        IceNet.sendMsg(`@${data.user} 谢谢${uname}送的${gift.giftNum}个${gift.giftName}:heartbeat:小冰亲密度+${gift.intimacy}`);
      }
      break
    default:
      break;
  }
}