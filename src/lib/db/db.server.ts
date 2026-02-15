import { env } from '$env/dynamic/private';
import { createPool } from 'mysql2';
import { Kysely, MysqlDialect } from 'kysely';
import type { Database } from './types.js';
import { createDbConfig } from './config.js';

const globalForDb = globalThis as unknown as { __db?: Kysely<Database> };

function createDb(): Kysely<Database> {
	const pool = createPool(createDbConfig(env));
	return new Kysely<Database>({ dialect: new MysqlDialect({ pool }) });
}

export function getDb(): Kysely<Database> {
	if (!globalForDb.__db) globalForDb.__db = createDb();
	return globalForDb.__db;
}
