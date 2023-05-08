import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configInfo as conf, writeConfig } from './Utils/config'
import { LOGGER } from './Utils/logger'

// 启动项目
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(conf.system.port);
  app.getUrl()
  LOGGER.Succ('IceNet is Online, Port:' + conf.system.port, 0)
}
bootstrap();
