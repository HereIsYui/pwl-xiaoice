import { Controller, Get, UseGuards, Query } from "@nestjs/common";
import { ApiService } from "./api.service";
import { CusGuardGuard } from "../cus-guard/cus-guard.guard";

@Controller("api")
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Get("GetUserIntimacy")
  @UseGuards(CusGuardGuard)
  GetUserIntimacy(@Query() query): any {
    if (!query.uid) return { code: 1, msg: "uid是必填的" };
    return this.apiService.GetUserIntimacy(query.uid);
  }

  @Get("GetUserCreditScore")
  @UseGuards(CusGuardGuard)
  GetUserCreditScore(@Query() query): any {
    if (!query.uid) return { code: 1, msg: "uid是必填的" };
    return this.apiService.GetUserCreditScore(query.uid);
  }
}
