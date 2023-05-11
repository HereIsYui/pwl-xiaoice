import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from '../entities/Client.entities';

@Module({
  // imports: [TypeOrmModule.forFeature([Client])],
  controllers: [],
  providers: []
})
export class ApiModule { }
