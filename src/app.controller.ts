import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { CusGuardGuard } from './cus-guard/cus-guard.guard';


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
  @UseGuards(CusGuardGuard)
  XiaoIceSendMsg(@Query() query): any {
    return this.appService.XiaoIceSendMsg(query.msg)
  }
}
