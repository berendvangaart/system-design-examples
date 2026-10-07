import {
  Controller,
  Get,
  Inject,
  ServiceUnavailableException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.constants.js';

const CHECK_TIMEOUT_MS = 2000;

type Check = { status: 'up' } | { status: 'down'; error: string };

@Controller('health')
export class HealthController {
  constructor(
    private readonly dataSource: DataSource,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  @Get()
  async check() {
    const [postgres, redis] = await Promise.all([
      this.probe(() => this.dataSource.query('SELECT 1')),
      this.probe(() => this.redis.ping()),
    ]);
    const result = {
      status:
        postgres.status === 'up' && redis.status === 'up' ? 'ok' : 'error',
      postgres,
      redis,
    };

    if (result.status !== 'ok') {
      throw new ServiceUnavailableException(result);
    }
    return result;
  }

  private async probe(fn: () => Promise<unknown>): Promise<Check> {
    try {
      await Promise.race([
        fn(),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error(`timeout after ${CHECK_TIMEOUT_MS}ms`)),
            CHECK_TIMEOUT_MS,
          ).unref(),
        ),
      ]);
      return { status: 'up' };
    } catch (err) {
      const { message, code, name } = err as NodeJS.ErrnoException;
      return { status: 'down', error: message || code || name };
    }
  }
}
