import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '🥪Hi，这里是小冰机器人！';
  }
}
