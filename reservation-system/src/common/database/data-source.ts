import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { DataSource } from 'typeorm';
import { databaseConfig } from '../config/database.config.js';

// Used by the TypeORM CLI and the seed script; the Nest app configures TypeORM in AppModule.
if (existsSync('.env')) {
  process.loadEnvFile();
}

export default new DataSource({
  type: 'postgres',
  ...databaseConfig(),
  uuidExtension: 'pgcrypto',
  entities: [join(import.meta.dirname, '../../**/*.entity.js')],
  migrations: [join(import.meta.dirname, 'migrations/*.js')],
});
