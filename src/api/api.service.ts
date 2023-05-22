import { Injectable } from '@nestjs/common';
import { LOGGER } from '../Utils/logger'
import { User } from '../entities/user.entities'
import { Credit } from '../entities/credit.entities';
import { Repository, MoreThan } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import * as dayjs from 'dayjs'
import axios from 'axios'
import * as md5 from 'md5';
import { configInfo as conf } from '../Utils/config';

@Injectable()
export class ApiService {
  constructor(@InjectRepository(User) private readonly user: Repository<User>, @InjectRepository(Credit) private readonly credit: Repository<Credit>) { }
  async GetUserIntimacy(user: string) {
    LOGGER.Log(`GetUserIntimacy:${user}`, 0)
    return {
      code: 0,
      data: await this.user.findOne({ select: ['uId', 'user', 'intimacy'], where: { user } }),
      msg: 'success'
    }
  }

  async UpdateUserCreditScore() {
    let IceUser = await this.user.find({ select: ['uId', 'user', 'intimacy'], where: { intimacy: MoreThan(10) } });
    // console.log(IceUser)
    let data = null;
    if (IceUser.length > 0) {
      for (let i = 0; i < IceUser.length; i++) {
        let u = IceUser[i];
        let sign = md5(`${u.user}${conf.keys.elves}${dayjs().format('YYYY-MM-DD')}${conf.keys.elves}${u.user}`);
        console.log(sign)
        let elvesUser = await axios({
          url: `https://fish.elves.online/ice/credit/get?user=${u.user}&sign=${sign}`,
          method: 'GET'
        })
        if (elvesUser.data.code == 0) {
          let CreditUser = await this.credit.findOne({ where: { user: u.user } });
          if (!CreditUser.id) {
            CreditUser = new Credit();
          }
          
        }
      }
      return { code: 0, msg: 'ok' }
    }
  }
}
