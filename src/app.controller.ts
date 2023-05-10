import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/chatInit')
  getChat(): string {
    return this.appService.initChat();
  }

  @Get('/XiaoIceSendMsg')
  XiaoIceSendMsg(@Query() query): any {
    if (!query.key || query.key != 'xiaoIceGame') {
      return { code: 1, msg: "缺少参数" }
    } else {
      return this.appService.XiaoIceSendMsg(query.msg)
    }
  }
}
