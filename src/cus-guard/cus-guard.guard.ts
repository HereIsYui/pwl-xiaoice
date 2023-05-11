import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AppService } from 'src/app.service';

@Injectable()
export class CusGuardGuard implements CanActivate {
  constructor(
    private readonly appService: AppService
  ) { }
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      const req = context.switchToHttp().getRequest<Request>();
      const client_id = req.headers['client_id'];
      const client_secret = req.headers['client_secret'];
      const roles = context.getHandler().name;
      if (!client_id || !client_secret) {
        resolve(false)
      } else {
        const user = await this.appService.findOneByClientId(client_id, client_secret);
        if (user && (user.roles === '*' || user.roles.split(",").includes(roles))) {
          resolve(true)
        } else {
          resolve(false)
        }
      }
    })
  }
}
