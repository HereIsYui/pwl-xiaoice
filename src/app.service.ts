import { Injectable } from '@nestjs/common';
import FishPi, { NoticeMsg } from 'fishpi';
import { configInfo as conf, writeConfig } from './Utils/config'
import { LOGGER } from './Utils/logger'
import { ChatCallBack } from './Utils/chat'

@Injectable()
export class AppService {
  getHello(): string {
    return '🥪Hi,这里是fishpi.cn的小冰机器人!';
  }
  initChat() {
    if (isChatOpen) {
      return 'Chat is Start!'
    } else {
      if (apiKey) {
        LOGGER.Log('有apiKey,直接连接', 0)
        fishInit();
      } else {
        LOGGER.Log('没有apiKey,去登录', 0)
        fishGetApiKey();
      }
      return 'Chat Start Success!'
    }
  }
}

let apiKey = conf.fishpi.apiKey;
let isChatOpen = false;
// 获取apiKey
async function fishGetApiKey() {
  let fish = new FishPi();
  let rsp = await fish.login({
    username: conf.fishpi.nameOrEmail,
    passwd: conf.fishpi.userPassword
  });
  LOGGER.Log(JSON.stringify(rsp), 1)
  if (rsp.code == 0) {
    apiKey = rsp.Key;
    // LOGGER.Log(apiKey,1)
    conf.fishpi.apiKey = apiKey;
    writeConfig(conf, (err: any) => {
      if (err) {
        LOGGER.Err('写入apiKey配置失败!', 1)
      } else {
        LOGGER.Succ('写入apiKey配置成功!', 1)
      }
    })
  };
  fishInit()
}

// 连接聊天室 & 监听私信消息
async function fishInit() {
  isChatOpen = true;
  let fish = new FishPi(apiKey);
  fish.chatroom.addListener(async (ev: any) => {
    // 处理消息
    let msgData = ev.msg.data;
    let user = msgData?.userName;
    if (ev.msg.type == 'redPacket' && msgData.content.recivers == '["fishpi"]') {
      // 只处理机器人专属红包
      let packet = await fish.chatroom.redpacket.open(msgData.oId);
      let pointNum = (packet as any).who[0].userMoney;
      ChatCallBack(fish, {
        oId: msgData.oId,
        uId: msgData.userOId,
        user: user,
        type: 1,
        point: pointNum
      });
      LOGGER.Log(`${user}给你发了一个红包,获得${pointNum}积分`, 1);
    }
    // 聊天消息处理 (不处理机器人消息)
    if (ev.msg.type == 'msg' && !['admin', 'xiaoIce', 'fishpi'].includes(user)) {
      // LOGGER.Log(JSON.stringify(msgData), 1)
      let msg = msgData.md;
      msg = msg.replace(/<span[^>]*?>(<\/span>)*$/, "");
      msg = msg.replace(/\n>.*/g, "");
      msg = msg.trim();
      ChatCallBack(fish, {
        oId: msgData.oId,
        uId: msgData.userOId,
        user: user,
        type: 0,
        msg: msg
      });
      LOGGER.Log(`${user}说：${msg}`, 1)
    }
  });

  // 监听私聊新消息
  fish.chat.addListener(async ({ msg }: { msg: NoticeMsg }) => {
    switch (msg.command) {
      // 私聊未读数更新
      case 'chatUnreadCountRefresh':
        if (msg.count! > 0) {
          let unreadMsgs = await fish.chat.unread();
        }
        else this.users.forEach((u, i) => {
          this.users[i].unread = 0;
        });
        break;
      // 新私聊消息
      case 'newIdleChatMessage':
        // msg 就是新的私聊消息
        ChatCallBack(fish, {
          oId: msg.userId,
          uId: msg.userId,
          user: msg.senderUserName,
          type: 2,
          msg: msg.preview
        });
        LOGGER.Log(msg.senderUserName + '私信你说：' + msg.preview, 1);
        break;
    }
  });
}