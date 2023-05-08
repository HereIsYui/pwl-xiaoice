import { Injectable } from '@nestjs/common';
import FishPi, { NoticeMsg } from 'fishpi';
import { configInfo as conf, writeConfig } from './Utils/config'
import { LOGGER } from './Utils/logger'
import { ChatCallBack } from './Utils/chat'
import { Like, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from './entities/user.entities'

@Injectable()
export class AppService {
  // 依赖注入
  isChatOpen: Boolean;
  apiKey: string;
  constructor(@InjectRepository(User) private readonly user: Repository<User>) {
    this.apiKey = conf.fishpi.apiKey;
  }
  getHello(): string {
    return '🥪Hi,这里是fishpi.cn的小冰机器人!';
  }
  initChat() {
    if (this.isChatOpen) {
      return 'Chat is Start!'
    } else {
      if (this.apiKey) {
        LOGGER.Log('有apiKey,直接连接', 0)
        this.fishInit();
      } else {
        LOGGER.Log('没有apiKey,去登录', 0)
        this.fishGetApiKey();
      }
      return 'Chat Start Success!'
    }
  }
  async fishGetApiKey() {
    let fish = new FishPi();
    let rsp = await fish.login({
      username: conf.fishpi.nameOrEmail,
      passwd: conf.fishpi.userPassword
    });
    LOGGER.Log(JSON.stringify(rsp), 1)
    if (rsp.code == 0) {
      this.apiKey = rsp.Key;
      // LOGGER.Log(apiKey,1)
      conf.fishpi.apiKey = this.apiKey;
      writeConfig(conf, (err: any) => {
        if (err) {
          LOGGER.Err('写入apiKey配置失败!', 1)
        } else {
          LOGGER.Succ('写入apiKey配置成功!', 1)
        }
      })
    };
    this.fishInit()
  }
  async fishInit() {
    this.isChatOpen = true;
    let fish = new FishPi(this.apiKey);
    fish.chatroom.addListener(async (ev: any) => {
      // 处理消息
      let msgData = ev.msg.data;
      let user = msgData?.userName;
      if (ev.msg.type == 'redPacket' && msgData.content.recivers == '["fishpi"]') {
        // 只处理机器人专属红包
        let packet = await fish.chatroom.redpacket.open(msgData.oId);
        let pointNum = (packet as any).who[0].userMoney;
        let uInfo = await this.user.find({ where: { uId: msgData.userOId } });
        let nUser = null;
        if (uInfo.length == 0) {
          nUser = new User();
          nUser.user = user;
          nUser.uId = msgData.userOId;
          nUser.intimacy = pointNum;
          this.user.save(nUser)
        } else {
          nUser = uInfo[0];
          nUser.intimacy += pointNum;
          this.user.update(nUser.id, nUser)
        }
        ChatCallBack(fish, {
          oId: msgData.oId,
          uId: msgData.userOId,
          user: user,
          type: 1,
          point: pointNum,
          detail: nUser
        });
        LOGGER.Log(JSON.stringify(uInfo), 0)
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

          break;
        // 新私聊消息
        case 'newIdleChatMessage':
          // msg 就是新的私聊消息
          // 这里uId不对，先不处理
          // let uInfo = await this.user.find({ where: { uId: msg.userId } });
          // let nUser = null;
          // if (uInfo.length == 0) {
          //   nUser = new User();
          //   nUser.user = msg.senderUserName;
          //   nUser.uId = msg.userId;
          //   nUser.intimacy = 1;
          //   this.user.save(nUser)
          // } else {
          //   nUser = uInfo[0];
          //   nUser.intimacy += 1;
          //   this.user.update(nUser.id, nUser)
          // }
          ChatCallBack(fish, {
            oId: msg.userId,
            uId: msg.userId,
            user: msg.senderUserName,
            type: 2,
            msg: msg.preview,
            detail: null
          });
          //LOGGER.Log(JSON.stringify(uInfo), 0)
          LOGGER.Log(msg.senderUserName + '私信你说：' + msg.preview, 1);
          break;
      }
    });
  }
}