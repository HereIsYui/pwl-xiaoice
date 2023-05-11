import { Injectable } from '@nestjs/common';
import { LOGGER } from '../Utils/logger'
import { User } from '../entities/user.entities'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'

@Injectable()
export class ApiService {
  constructor(@InjectRepository(User) private readonly user: Repository<User>) { }
  async GetUserIntimacy(user: string) {
    LOGGER.Log(`GetUserIntimacy:${user}`, 0)
    return {
      code: 0,
      data: await this.user.findOne({ select: ['uId', 'user', 'intimacy'], where: { user } }),
      msg: 'success'
    }
  }
}
