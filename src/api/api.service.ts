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
  constructor(@InjectRepository(User) private readonly user: Repository<User>,
    @InjectRepository(Credit) private readonly credit: Repository<Credit>) { }
  async GetUserIntimacy(user: string) {
    return {
      code: 0,
      data: await this.user.findOne({ select: ['uId', 'user', 'intimacy'], where: { user } }),
      msg: 'success'
    }
  }

  async GetUserCreditScore(user: string) {
    return {
      code: 0,
      data: await this.credit.findOne({ select: ['uId', 'user', 'base_score', 'activity_score', 'reward_score', 'credit_score'], where: { user } }),
      msg: 'success'
    }
  }
}
