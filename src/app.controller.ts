import { Controller, Get, Query, Post, UseGuards, Headers, Body } from "@nestjs/common";
import { AppService } from "./app.service";
import { CusGuardGuard } from "./cus-guard/cus-guard.guard";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("/chatInit")
  getChat(): string {
    return this.appService.initChat();
  }

  @Get("reloadIce")
  @UseGuards(CusGuardGuard)
  reloadIce() {
    return this.appService.reloadIce();
  }

  @Get("/XiaoIceSendMsg")
  @UseGuards(CusGuardGuard)
  XiaoIceSendMsg(@Query() query): any {
    return this.appService.XiaoIceSendMsg(query.msg);
  }

  @Get("/XiaoIceSendPYQ")
  @UseGuards(CusGuardGuard)
  XiaoIceSendPYQ(@Headers("client_id") client_id: string, @Headers("client_secret") client_secret: string) {
    return this.appService.SendPYQMsg();
  }

  @Get("/UpdateUserCreditScore")
  UpdateUserCreditScore() {
    return this.appService.UpdateUserCreditScore();
  }

  @Post("/admin/bribe")
  @UseGuards(CusGuardGuard)
  updateXiaoIceIntimacy(@Body() data) {
    return this.appService.updateXiaoIceIntimacy(data);
  }
}
