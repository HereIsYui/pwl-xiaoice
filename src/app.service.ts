import { Injectable } from '@nestjs/common';
import FishPi, { FingerTo, ChatData, NoticeMsg } from 'fishpi';
import { configInfo as conf, writeConfig } from './Utils/config'
import { LOGGER } from './Utils/logger'
import { ChatCallBack } from './Utils/chat'
import { Like, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from './entities/user.entities'
import { City } from './entities/city.entities';

@Injectable()
export class AppService {
  // 依赖注入
  isChatOpen: Boolean;
  apiKey: string;
  constructor(@InjectRepository(User) private readonly user: Repository<User>, @InjectRepository(City) private readonly city: Repository<City>) {
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
      //console.log(ev.msg.type); barrager
      if ((ev.msg.type == 'barrager' || ev.msg.type == 'msg') && user == 'xiong') {
        let msginfo = ev.msg.type == 'barrager' ? msgData.barragerContent : msgData.md;
        if (/(xiàmù|我).{0,10}(是帅哥|帅哥)/.test(msginfo)) {
          await FingerTo(conf.keys.point).editUserPoints(user, -250, "聊天室造谣,250积分已扣除")
          fish.chatroom.send(`@${user} 聊天室造谣,250积分已扣除`)
        }
      }
      if (ev.msg.type == 'redPacket' && msgData.content.recivers == '["' + conf.fishpi.nameOrEmail + '"]') {
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
        let nUser = null;
        if (/^小冰/.test(msg)) {
          let uInfo = await this.user.find({ where: { uId: msgData.userOId } });
          if (uInfo.length == 0) {
            nUser = new User();
            nUser.user = user;
            nUser.uId = msgData.userOId;
            nUser.intimacy = 1;
            this.user.save(nUser)
          } else {
            nUser = uInfo[0];
            nUser.intimacy += 1;
            this.user.update(nUser.id, nUser)
          }
        }
        ChatCallBack(fish, {
          oId: msgData.oId,
          uId: msgData.userOId,
          user: user,
          type: 0,
          msg: msg,
          detail: nUser
        }, this);
        LOGGER.Log(`${user}说：${msg}`, 1)
      }
    });

    // 监听私聊新消息
    fish.chat.addListener(async ({ msg }: { msg: NoticeMsg }) => {
      switch (msg.command) {
        // 私聊未读数更新
        case 'chatUnreadCountRefresh':

          if (msg.count > 0) {
            let unreadMsgs = await fish.chat.unread();
            console.log(unreadMsgs)
          }
          break;
        // 新私聊消息
        case 'newIdleChatMessage':
          // msg 就是新的私聊消息
          if (msg.senderUserName != 'sevenSummer') {
            ChatCallBack(fish, {
              oId: msg.userId,
              uId: msg.userId,
              user: msg.senderUserName,
              type: 2,
              msg: msg.preview,
              detail: null
            });
          }
          LOGGER.Log(msg.senderUserName + '私信你说：' + msg.preview, 1);
          break;
      }
    });

    fish.chat.addListener(async ({ msg }: { msg: ChatData }) => {
      let reg = /(\.\.\.\d+)|(:\s.+\s赠)|(\.\.\.\s.{2})/g;
      if (msg.content.indexOf("获得") >= 0 && reg.test(msg.content)) {
        let giftNum = msg.content.match(reg)[0].replace("...", "");
        let giftName = msg.content.match(reg)[1].replace("... ", "").trim();
        let giftUserInfo = msg.content.match(reg)[2].split(" ")[1];
        let giftUser = giftUserInfo.split("|")[0];
        let giftUid = giftUserInfo.split("|")[1];
        let uInfo = await this.user.find({ where: { uId: giftUid } });
        let nUser = null;
        let intimacy = (giftName == "鱼丸" ? 1 : 10) * parseInt(giftNum);
        if (parseInt(giftNum) <= 0) {
          intimacy = -10
        }
        if (uInfo.length == 0) {
          nUser = new User();
          nUser.user = giftUser;
          nUser.uId = giftUid;
          nUser.intimacy = intimacy;
          this.user.save(nUser)
        } else {
          nUser = uInfo[0];
          nUser.intimacy += intimacy;
          this.user.update(nUser.id, nUser)
        }
        ChatCallBack(fish, {
          oId: msg.oId,
          uId: msg.fromId,
          user: giftUser,
          type: 3,
          msg: JSON.stringify({ giftNum, giftName, giftUser, intimacy }),
          detail: nUser
        });
        LOGGER.Log(giftUser + '赠送了你' + giftName + "*" + giftNum, 1);
      }
    }, 'sevenSummer');
  }
}