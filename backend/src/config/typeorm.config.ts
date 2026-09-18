import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';

/**
 * Single source of truth for connection options, shared by:
 *  - the running application (wired through TypeOrmModule.forRootAsync)
 *  - the TypeORM CLI (`npm run migration:run`, etc.), which needs a
 *    plain DataSource default-exported from this file.
 *
 * `synchronize` is always false — Olfatto never relies on auto-sync
 * (point 59). Schema changes only happen through migrations.
 */
export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
  username: process.env.DATABASE_USER ?? 'olfatto_user',
  password: process.env.DATABASE_PASSWORD ?? '',
  database: process.env.DATABASE_NAME ?? 'olfatto',
  entities: [__dirname + '/../**/*.orm-entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations_history',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
};

const dataSource = new DataSource(typeOrmConfig);
export default dataSource;
