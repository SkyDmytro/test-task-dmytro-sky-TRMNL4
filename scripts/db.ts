import { createPool } from 'mysql2';
import { Kysely, MysqlDialect } from 'kysely';
import type { Database } from '../src/lib/db/types.js';
import { createDbConfig } from '../src/lib/db/config.js';

export function getDb(): Kysely<Database> {
	return new Kysely<Database>({
		dialect: new MysqlDialect({
			pool: createPool(createDbConfig(process.env))
		})
	});
}
