import { Injectable } from '@nestjs/common';
import FishPi, { FingerTo, ChatData, NoticeMsg, ChatMsg, BarragerMsg, RedPacket, NoticePoint } from 'fishpi';
import { configInfo as conf, writeConfig } from './Utils/config'
import { LOGGER } from './Utils/logger'
import { ChatCallBack } from './Utils/chat'
import { Like, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from './entities/user.entities'
import { City } from './entities/city.entities';
import { Client } from './entities/Client.entities';
import { Bank } from './entities/bank.entities';
import { BankRecords } from './entities/bankrecord.entities';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';

@Injectable()
export class AppService {
  // 依赖注入
  isChatOpen: Boolean;
  apiKey: string;
  fish: FishPi;
  constructor(@InjectRepository(User) private readonly user: Repository<User>,
    @InjectRepository(City) private readonly city: Repository<City>,
    @InjectRepository(Client) private readonly client: Repository<Client>,
    @InjectRepository(Bank) private readonly bank: Repository<Bank>,
    @InjectRepository(BankRecords) private readonly bankRecords: Repository<BankRecords>) {
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
  sendMsg(msg: string) {
    msg = msg + `\n\n <span id='IceNet-${new Date().getTime()}'></span>`
    this.fish.chatroom.send(msg)
  }
  async fishGetApiKey() {
    this.fish = new FishPi();
    let rsp = await this.fish.login({
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
    this.fish = new FishPi(this.apiKey);
    this.fish.chatroom.setVia('IceNet', "2.0");
    this.fish.chatroom.addListener(async ({ msg }) => {
      // 处理消息
      let ChatMsgData = msg.data as ChatMsg;
      let BarragerMsgData = msg.data as BarragerMsg;
      let user = ChatMsgData?.userName;
      if ((msg.type == 'barrager' || msg.type == 'msg') && user == 'xiong') {
        let msginfo = msg.type == 'barrager' ? BarragerMsgData.barragerContent : ChatMsgData.md;
        if (/(xiàmù|我).{0,10}(是帅哥|帅哥|帅)/.test(msginfo)) {
          let xiongInfo = await this.fish.user('xiong');
          let xiongPoint = xiongInfo.userPoint;
          if (xiongPoint >= 250) {
            await FingerTo(conf.keys.point).editUserPoints(user, -250, "聊天室造谣,250积分已扣除")
            if (msg.type == 'msg') {
              await this.fish.chatroom.revoke(ChatMsgData.oId);
            }
            this.sendMsg(`@${user} 聊天室造谣,250积分已扣除`)
          } else {
            if (msg.type == 'msg') {
              await this.fish.chatroom.revoke(ChatMsgData.oId);
            }
            this.sendMsg(`@${user} 啧啧啧,你看看你 250积分都没有 还造谣`);
          }
          return;
        }
      }
      if (msg.type == 'redPacket' && (ChatMsgData.content as RedPacket).recivers.includes(conf.fishpi.nameOrEmail)) {
        // 只处理机器人专属红包
        let packet = await this.fish.chatroom.redpacket.open(ChatMsgData.oId);
        let pointNum = (packet as any).who[0].userMoney;
        let intimacy = Math.floor(pointNum / 3);
        // 判断是否为存款
        if ((ChatMsgData.content as RedPacket).msg.indexOf('存') == -1) {
          // 不是存款
          let uInfo = await this.user.find({ where: { uId: ChatMsgData.userOId } });
          let nUser = null;
          if (uInfo.length == 0) {
            nUser = new User();
            nUser.user = user;
            nUser.uId = ChatMsgData.userOId;
            nUser.intimacy = intimacy;
            nUser.point = pointNum;
            this.user.save(nUser)
          } else {
            nUser = uInfo[0];
            nUser.intimacy += intimacy;
            nUser.point += pointNum;
            this.user.update(nUser.id, nUser)
          }
          ChatCallBack(this.fish, {
            oId: ChatMsgData.oId,
            uId: ChatMsgData.userOId,
            user: user,
            type: 1,
            point: pointNum,
            detail: nUser
          }, this);
        } else {
          // 银行存款
          let uInfo = await this.user.find({ where: { uId: ChatMsgData.userOId } });
          let nUser = null;
          if (uInfo.length == 0) {
            nUser = new User();
            nUser.user = user;
            nUser.uId = ChatMsgData.userOId;
            this.user.save(nUser)
          } else {
            nUser = uInfo[0];
            this.user.update(nUser.id, nUser)
          }
          ChatCallBack(this.fish, {
            oId: ChatMsgData.oId,
            uId: ChatMsgData.userOId,
            user: user,
            type: 4,
            detail: [{
              dataId: ChatMsgData.oId,
              user: user,
              point: pointNum,
              access: 0,
              access_type: 1,
              momo: packet.msg
            }]
          }, this);
        }
        //LOGGER.Log(JSON.stringify(uInfo), 0)
        LOGGER.Log(`${user}给你发了一个红包,获得${pointNum}积分`, 1);
      }
      // 聊天消息处理 (不处理机器人消息)
      if (msg.type == 'msg' && !['admin', 'xiaoIce', 'fishpi'].includes(user)) {
        let msg = ChatMsgData.md;
        msg = msg.replace(/<span[^>]*?>(<\/span>)*$/, "");
        msg = msg.replace(/\n>.*/g, "");
        msg = msg.trim();
        let nUser = null;
        let uInfo = await this.user.find({ where: { uId: ChatMsgData.userOId } });
        if (uInfo.length == 0) {
          nUser = new User();
          nUser.user = user;
          nUser.uId = ChatMsgData.userOId;
          nUser.intimacy = 0;
          this.user.save(nUser)
        } else {
          nUser = uInfo[0]
        }
        ChatCallBack(this.fish, {
          oId: ChatMsgData.oId,
          uId: ChatMsgData.userOId,
          user: user,
          type: 0,
          msg: msg,
          detail: nUser
        }, this);
        LOGGER.Log(`${user}说：${msg}`, 1)
      }
    });

    // 监听私聊新消息
    this.fish.chat.addListener(async ({ msg }: { msg: NoticeMsg }) => {
      switch (msg.command) {
        // 私聊未读数更新
        case 'chatUnreadCountRefresh':

          if (msg.count > 0) {
            let unreadMsgs = await this.fish.chat.unread();
            console.log(unreadMsgs)
          }
          break;
        // 新私聊消息
        case 'newIdleChatMessage':
          // msg 就是新的私聊消息
          if (!['sevenSummer', 'xiaoIce'].includes(msg.senderUserName)) {
            ChatCallBack(this.fish, {
              oId: msg.userId,
              uId: msg.userId,
              user: msg.senderUserName,
              type: 2,
              msg: msg.preview,
              detail: null
            }, this);
          }
          LOGGER.Log(msg.senderUserName + '私信你说：' + msg.preview, 1);
          break;
        // 有新的消息通知
        case 'refreshNotification':
          let notice = await this.fish.notice.count();
          if (notice.unreadPointNotificationCnt > 0) {
            let pointInfo = await this.fish.notice.list('point');
            await this.fish.notice.readAll();
            if (pointInfo.code == 0) {
              let BankRecord = [];
              pointInfo.data.forEach((item: NoticePoint) => {
                // 有未读的转账
                if (item.hasRead == false && item.dataType === 6) {
                  if (item.description.indexOf('系统') >= 0) {
                    return;
                  }
                  let reg = /(>.+<)|(\s\d+\s)|(\(.+\))/g;
                  // console.log(item.description.match(reg))
                  let bankUser = item.description.match(reg)[0].replace(/>|</g, "").trim();
                  let bankPoint = item.description.match(reg)[1].trim();
                  let bankMsg = item.description.match(reg)[2]?.replace(/\(|\)/g, "").trim();
                  BankRecord.push({
                    dataId: item.dataId,
                    user: bankUser,
                    point: bankPoint,
                    access: 0,
                    access_type: 0,
                    momo: bankMsg
                  })
                  LOGGER.Succ(`储户${bankUser}存了${bankPoint}积分[备注:${bankMsg}]`, 1)
                }
              })
              ChatCallBack(this.fish, {
                oId: new Date().getTime().toString(),
                user: '',
                type: 4,
                detail: BankRecord
              }, this);
            }
          }
          break;
      }
    });

    this.fish.chat.addListener(async ({ msg }: { msg: ChatData }) => {
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
        ChatCallBack(this.fish, {
          oId: msg.oId,
          uId: msg.fromId,
          user: giftUser,
          type: 3,
          msg: JSON.stringify({ giftNum, giftName, giftUser, intimacy }),
          detail: nUser
        }, this);
        LOGGER.Log(giftUser + '赠送了你' + giftName + "*" + giftNum, 1);
      }
    }, 'sevenSummer');
  }
  XiaoIceSendMsg(data: any) {
    this.sendMsg(data);
    return { code: 0, msg: "ok" }
  }
  async findOneByClientId(clientId: string, clientSecret: string) {
    return await this.client.findOne({
      where: {
        client_id: clientId,
        client_secret: clientSecret
      }
    })
  }
  addXiaoIceUser(data: any) {
    let clientData = new Client();
    clientData.client_id = data.client_id;
    clientData.client_secret = data.client_secret;
    clientData.roles = data.roles;
    this.client.save(clientData);
    return 'ok'
  }
  // 发朋友圈(清风明月)
  @Cron('0 30 10 * * 1-5')
  async SendPYQMsg() {
    const pyq = await axios({
      method: 'get',
      url: `https://apis.tianapi.com/pyqwenan/index?key=${conf.weather.tianApi}`
    })
    let pyqDetail = '';
    let cb = { code: 0, msg: '发送成功' }
    if (pyq.data.code == 200) {
      pyqDetail = pyq.data.result.content;
      await this.fish.breezemoon.send(pyqDetail);
      // 顺便领取下昨日活跃
      await this.fish.account.rewardLiveness();
    } else {
      cb.code = 1;
      cb.msg = "发送失败";
    }
    return cb
  }
}