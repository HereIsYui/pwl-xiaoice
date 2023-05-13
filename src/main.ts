import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as servestatic from 'serve-static';
import * as path from 'path'
import { configInfo as conf, writeConfig } from './Utils/config'
import { LOGGER } from './Utils/logger'
import fetch from 'node-fetch'
globalThis.fetch = fetch as any;

// 启动项目
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use('/file', servestatic(path.join(__dirname, '../public')));
  await app.listen(conf.system.port);

  LOGGER.Succ('IceNet is Online, Port:' + conf.system.port, 0);
}
bootstrap();
