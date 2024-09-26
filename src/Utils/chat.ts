import type FishPi from "fishpi";
import type { ChatMsg } from "../types";
import { GlobalRuleList } from "./rule";
import * as dayjs from "dayjs";
import { BankRecords } from "../entities/bankrecord.entities";
import { Bank } from "src/entities/bank.entities";
import { configInfo as conf, writeConfig } from "../Utils/config";

export const ChatCallBack = async function (fish: FishPi, data: ChatMsg, IceNet?: any) {
  let uname = data.user;
  if (data.detail && data.detail.intimacy < 100) {
    uname = data.user;
  } else if (data.detail && data.detail.intimacy < 500) {
    uname = data.detail ? (data.detail.gender == "1" ? "哥哥" : "姐姐") : data.user;
  } else {
    uname = data.detail ? (data.detail.nick_name ? data.detail.nick_name : data.detail.gender == "1" ? "哥哥" : "姐姐") : data.user;
  }
  switch (data.type) {
    case 0:
      // 普通消息处理
      IceNet.UDetail = data.detail;
      IceNet.UName = uname;
      let cb: any = "";
      if (data.detail.intimacy < 0 && data.msg.indexOf("小冰") == 0) {
        cb = "小冰不想搭理你,并向你嘴巴里塞了个冰块🧊 \n\n > 亲密度过低警告";
      } else {
        cb = await GlobalRuleList.find((r) => r.rule.test(data.msg))?.func({
          user: data.user,
          msg: data.msg,
          fish,
          IceNet,
          conf,
          data,
        });
      }
      if (cb) {
        IceNet.sendMsg(`@${data.user} \n ${uname} ${cb}`);
        data.detail.intimacy = data.detail.intimacy + 1;
        if (data.detail.id) {
          IceNet.user.update(data.detail.id, data.detail);
        }
      }
      break;
    case 1:
      // 专属红包消息处理
      IceNet.sendMsg(`@${data.user} 谢谢${uname}送的红包:heartbeat:`);
      break;
    case 2:
      // 私信消息处理
      fish.chat.send(
        data.user,
        '🥪Hi\n这里是小冰机器人!\n私聊的消息小冰暂时不做处理哦~\n如有事请联系小冰管理员:<a href="https://fishpi.cn/chat?toUser=Yui" target="_blank">Yui</a>'
      );
      break;
    case 3:
      // 凌 礼物处理
      const gift = JSON.parse(data.msg);
      if (gift.num <= 0) {
        IceNet.sendMsg(`@${data.user} 小气鬼${uname},一个${gift.item}都不给我,小冰亲密度${gift.intimacy}`);
      } else if (gift.num <= 5) {
        IceNet.sendMsg(`@${data.user} 谢谢小气鬼${uname}送的${gift.num}个${gift.item},小冰亲密度+${gift.intimacy}`);
      } else {
        IceNet.sendMsg(`@${data.user} 谢谢${uname}送的${gift.num}个${gift.item}:heartbeat:小冰亲密度+${gift.intimacy}`);
      }
      break;
    case 4:
      // IceBank存事件
      const BankList = data.detail;
      for (let i = 0; i < BankList.length; i++) {
        const BankInfo = BankList[i];
        console.log(BankInfo.user);
        const user = await IceNet.bank.find({ where: { user: BankInfo.user } });
        const OrderId = "IceBank-" + dayjs().format("YYYYMMDDHHmmssSSS");
        const uRecord = new BankRecords();
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
          await IceNet.bankRecords.save(uRecord);
          fish.chat.send(
            BankInfo.user,
            `【IceBank-交易失败通知】:交易积分:${BankInfo.point} \n 交易方式:存 \n 失败原因:用户未开户 \n 交易单号:${OrderId} \n 请私信交易单号给<a href="https://fishpi.cn/chat?toUser=Yui" target="_blank">Yui</a>`
          );
        } else if (user.length == 0 && BankInfo.access_type == 1) {
          // 未开户&红包存款
          const newUser = new Bank();
          newUser.uId = data.uId;
          newUser.user = data.user;
          newUser.point = uRecord.point;
          newUser.bank_id = "ICE" + new Date().getTime().toString();
          await IceNet.bank.save(newUser);
          uRecord.uId = data.uId;
          uRecord.is_success = 1;
          await IceNet.bankRecords.save(uRecord);
          IceNet.sendMsg(
            `@${BankInfo.user} ,【IceBank-开户成功通知】:交易积分:${BankInfo.point} \n 交易方式:存 \n 交易单号:${OrderId} \n 卡号:${newUser.bank_id}`
          );
        } else {
          // 已开户存款
          const uDetail = user[0];
          uRecord.is_success = 1;
          uDetail.point = (parseInt(uDetail.point) + parseInt(BankInfo.point)).toString();
          if (BankInfo.access_type == 1) {
            uRecord.uId = data.uId;
            IceNet.sendMsg(`@${BankInfo.user} ,【IceBank-交易通知】:交易积分:${BankInfo.point} \n 交易方式:存 \n 交易单号:${OrderId}`);
          } else {
            fish.chat.send(BankInfo.user, `【IceBank-交易通知】:交易积分:${BankInfo.point} \n 交易方式:存 \n 交易单号:${OrderId}`);
          }
          await IceNet.bank.update(uDetail.id, uDetail);
          await IceNet.bankRecords.save(uRecord);
        }
      }
      break;
    default:
      break;
  }
};
