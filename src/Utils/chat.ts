import type FishPi from 'fishpi'
import type { ChatMsg } from './type'
export const ChatCallBack = function (fish: FishPi, data: ChatMsg) {
  switch (data.type) {
    case 0:
      // 普通消息处理
      break;
    case 1:
      // 专属红包消息处理
      let uname = data.detail ? (data.detail.nick_name ? data.detail.nick_name : (data.detail.gender == 0 ? '哥哥' : '姐姐')) : '老板'
      fish.chatroom.send(`@${data.user} 感谢${uname}的红包:heartbeat:`);
      break
    case 2:
      // 私信消息处理
      fish.chat.send(data.user, `🥪Hi\n这里是小冰机器人!\n私聊的消息小冰暂时不做处理哦~\n如有事请联系小冰管理员:<a href="https://fishpi.cn/chat?toUser=Yui" target="_blank">Yui</a>`);
      break;
    default:
      break;
  }
}