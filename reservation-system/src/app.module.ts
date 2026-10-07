import { Module } from '@nestjs/common';
import { ConfigModule, type ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { databaseConfig } from './config/database.config.js';
import { redisConfig } from './config/redis.config.js';
import { RedisModule } from './redis/redis.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [databaseConfig.KEY],
      useFactory: (config: ConfigType<typeof databaseConfig>) => ({
        type: 'postgres',
        ...config,
        autoLoadEntities: true,
      }),
    }),
    RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
