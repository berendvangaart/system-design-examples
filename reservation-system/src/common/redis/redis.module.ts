import {
  Global,
  Inject,
  Module,
  type OnApplicationShutdown,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { Redis } from 'ioredis';
import { redisConfig } from '../config/redis.config.js';
import { REDIS_CLIENT } from './redis.constants.js';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [redisConfig.KEY],
      useFactory: (config: ConfigType<typeof redisConfig>) => new Redis(config),
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule implements OnApplicationShutdown {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async onApplicationShutdown() {
    await this.redis.quit();
  }
}
