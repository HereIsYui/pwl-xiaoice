import type FishPi from 'fishpi'
import type { ChatMsg } from './type'
export const ChatCallBack = function (fish: FishPi, data: ChatMsg) {
  switch (data.type) {
    case 0:
      // 普通消息处理
      break;
    case 1:
      // 专属红包消息处理
      fish.chatroom.send(`感谢${data.user}老板的${data.point}积分～`);
      break
    case 2:
      // 私信消息处理
      fish.chat.send(data.user, '🥪Hi,这里是小冰机器人! \nbut,小冰暂时不能进行私信对话哦T-T \n如有问题请私信Yui~');
      break;
    default:
      break;
  }
}