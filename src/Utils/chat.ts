import type FishPi from 'fishpi'
import type { ChatMsg } from './type'
import { GlobalRuleList } from './rule'
import * as dayjs from 'dayjs'
import { BankRecords } from 'src/entities/bankrecord.entities'
import { Bank } from 'src/entities/bank.entities'

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
            data.detail.intimacy = data.detail.intimacy + 1;
            if(data.detail.id){
              IceNet.user.update(data.detail.id, data.detail)
            }
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
      if (gift.num <= 0) {
        IceNet.sendMsg(`@${data.user} 小气鬼${uname},一个${gift.item}都不给我,小冰亲密度${gift.intimacy}`);
      } else if (gift.num <= 5) {
        IceNet.sendMsg(`@${data.user} 谢谢小气鬼${uname}送的${gift.num}个${gift.item},小冰亲密度+${gift.intimacy}`);
      } else {
        IceNet.sendMsg(`@${data.user} 谢谢${uname}送的${gift.num}个${gift.item}:heartbeat:小冰亲密度+${gift.intimacy}`);
      }
      break
    case 4:
      // IceBank存事件
      let BankList = data.detail;
      for (let i = 0; i < BankList.length; i++) {
        let BankInfo = BankList[i];
        console.log(BankInfo.user);
        let user = await IceNet.bank.find({ where: { user: BankInfo.user } });
        let OrderId = 'IceBank-' + dayjs().format('YYYYMMDDHHmmssSSS');
        let uRecord = new BankRecords();
        uRecord.order_id = OrderId;
        uRecord.user = BankInfo.user;
        uRecord.data_id = BankInfo.dataId;
        uRecord.point = BankInfo.point;
        uRecord.balance = BankInfo.point;
        uRecord.access = BankInfo.access;
        uRecord.access_type = BankInfo.access_type;
        if (user.length == 0 && BankInfo.access_type == 0) {
          // 未开户&转账存款
          uRecord.is_success = 0;
          await IceNet.bankRecords.save(uRecord)
          fish.chat.send(BankInfo.user, `【IceBank-交易失败通知】:交易积分:${BankInfo.point} \n 交易方式:存 \n 失败原因:用户未开户 \n 交易单号:${OrderId} \n 请私信交易单号给<a href="https://fishpi.cn/chat?toUser=Yui" target="_blank">Yui</a>`)
        } else if (user.length == 0 && BankInfo.access_type == 1) {
          // 未开户&红包存款
          let newUser = new Bank();
          newUser.uId = data.uId;
          newUser.user = data.user;
          newUser.point = uRecord.point;
          newUser.bank_id = 'ICE' + (new Date().getTime()).toString();
          await IceNet.bank.save(newUser);
          uRecord.uId = data.uId;
          uRecord.is_success = 1;
          await IceNet.bankRecords.save(uRecord);
          IceNet.sendMsg(`@${BankInfo.user} ,【IceBank-开户成功通知】:交易积分:${BankInfo.point} \n 交易方式:存 \n 交易单号:${OrderId} \n 卡号:${newUser.bank_id}`);
        } else {
          // 已开户存款
          let uDetail = user[0];
          uRecord.is_success = 1;
          uDetail.point = (parseInt(uDetail.point) + parseInt(BankInfo.point)).toString();
          if (BankInfo.access_type == 1) {
            uRecord.uId = data.uId;
            IceNet.sendMsg(`@${BankInfo.user} ,【IceBank-交易通知】:交易积分:${BankInfo.point} \n 交易方式:存 \n 交易单号:${OrderId}`)
          } else {
            fish.chat.send(BankInfo.user, `【IceBank-交易通知】:交易积分:${BankInfo.point} \n 交易方式:存 \n 交易单号:${OrderId}`);
          }
          await IceNet.bank.update(uDetail.id, uDetail)
          await IceNet.bankRecords.save(uRecord);
        }
      }
      break
    default:
      break;
  }
}