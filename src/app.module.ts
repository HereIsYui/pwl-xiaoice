import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configInfo as conf } from './Utils/config'
import { User } from './entities/user.entities';
import { City } from './entities/city.entities';

@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'mysql',
    host: conf.database.host,       // 数据库的连接地址host
    port: conf.database.port,              // 数据库的端口 3306
    username: conf.database.user,        // 连接账号
    password: conf.database.password,     // 连接密码
    database: conf.database.database,     // 连接的表名
    retryDelay: 500,         // 重试连接数据库间隔
    retryAttempts: 10,       // 允许重连次数
    synchronize: true,       // 是否将实体同步到数据库
    autoLoadEntities: true,  // 自动加载实体配置，forFeature()注册的每个实体都自己动加载
  }), TypeOrmModule.forFeature([User, City])],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
