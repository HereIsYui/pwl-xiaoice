import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ApiService } from './api.service';
import { CusGuardGuard } from '../cus-guard/cus-guard.guard';

@Controller('api')
export class ApiController {
  constructor(private readonly apiService: ApiService) { }

  @Get('GetUserIntimacy')
  @UseGuards(CusGuardGuard)
  GetUserIntimacy(@Query() query): any {
    if (!query.user) return { code: 1, msg: 'user是必填的' }
    return this.apiService.GetUserIntimacy(query.user);
  }

  @Get('UpdateUserCreditScore')
  UpdateUserCreditScore() {
    return this.apiService.UpdateUserCreditScore();
  }
}
