import { Inject } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE_DB } from '../drizzle/drizzle.module';
import * as schema from '@announce-board/db';

export abstract class BaseRepository {
  constructor(@Inject(DRIZZLE_DB) protected readonly db: PostgresJsDatabase<typeof schema>) {}
}
