import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as servestatic from 'serve-static';
import * as path from 'path'
import { configInfo as conf } from './Utils/config'
import { LOGGER } from './Utils/logger'
import fetch, { Headers, Request, Response } from 'node-fetch';

if (!('fetch' in globalThis)) {
  Object.assign(globalThis, { fetch, Headers, Request, Response })
}

// 启动项目
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use('/file', servestatic(path.join(__dirname, '../public')));
  await app.listen(conf.system.port);

  LOGGER.Succ('IceNet is Online, Port:' + conf.system.port, 0);
}
bootstrap();
