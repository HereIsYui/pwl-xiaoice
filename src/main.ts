import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import FishPi, { NoticeMsg } from 'fishpi';
import { configInfo as conf, writeConfig } from './Utils/config'
import { LOGGER } from './Utils/logger'

let apiKey = conf.fishpi.apiKey;
// 获取apiKey
async function fishGetApiKey() {
  let fish = new FishPi();
  let rsp = await fish.login({
    username: conf.fishpi.nameOrEmail,
    passwd: conf.fishpi.userPassword
  });
  LOGGER.Log(JSON.stringify(rsp))
  if (rsp.code == 0) {
    apiKey = rsp.Key;
    LOGGER.Log(apiKey)
    conf.fishpi.apiKey = apiKey;
    writeConfig(conf, (err: any) => {
      if (err) {
        LOGGER.Err('写入apiKey配置失败!')
      } else {
        LOGGER.Succ('写入apiKey配置成功!')
      }
    })
  };
  fishInit()
}

// 连接聊天室 & 监听私信消息
async function fishInit() {
  let fish = new FishPi(apiKey);
  fish.chatroom.addListener(async (ev: any) => {
    // 处理消息
    if (ev.msg.type == 'redPacket') {
      // 只处理机器人专属红包
      if (ev.msg.data.content.recivers == '["fishpi"]') {
        let packet = await fish.chatroom.redpacket.open(ev.msg.data.oId);
        let pointNum = (packet as any).who[0].userMoney;
        LOGGER.Log(pointNum);
        let user = ev.msg.data.userName;
        fish.chatroom.send(`感谢${user}老板的${pointNum}积分～`);
      }
    }
    // 聊天消息处理
    if (ev.msg.type == 'msg') {
      let msg = ev.msg.data.md;
      msg = msg.replace(/<span[^>]*?>(<\/span>)*$/, "");
      let user = ev.msg.data.userName;
      LOGGER.Log(user + ":" + msg)
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
        console.log(msg.senderUserName, '私信你说：', msg.preview);
        break;
      // 有新的消息通知
      case 'refreshNotification':
        console.log('你有新消息【', await fish.notice.count(), '】')
        break;
    }
  });
}

// 启动项目
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(conf.system.port);
  LOGGER.Succ('IceNet is Online Port:' + conf.system.port)
  if (apiKey) {
    LOGGER.Log('有apiKey,直接连接')
    await fishInit();
  } else {
    LOGGER.Log('没有apiKey,去登录')
    await fishGetApiKey();
  }
}
bootstrap();
