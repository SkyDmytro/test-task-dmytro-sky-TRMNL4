import * as path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import { createPool } from 'mysql2';
import { Kysely, Migrator, MysqlDialect, FileMigrationProvider } from 'kysely';
import type { Database } from '../src/lib/db/types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function migrateToLatest() {
	const db = new Kysely<Database>({
		dialect: new MysqlDialect({
			pool: createPool({
				host: process.env.DB_HOST ?? 'localhost',
				port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
				database: process.env.DB_NAME ?? 'app',
				user: process.env.DB_USER,
				password: process.env.DB_PASSWORD
			})
		})
	});

	const migrator = new Migrator({
		db,
		provider: new FileMigrationProvider({
			fs,
			path,
			migrationFolder: path.join(__dirname, '..', 'migrations')
		})
	});

	const { error, results } = await migrator.migrateToLatest();

	results?.forEach((it) => {
		if (it.status === 'Success') {
			console.log(`migration "${it.migrationName}" was executed successfully`);
		} else if (it.status === 'Error') {
			console.error(`failed to execute migration "${it.migrationName}"`);
		}
	});

	if (error) {
		console.error('failed to migrate');
		console.error(error);
		await db.destroy();
		process.exit(1);
	}

	await db.destroy();
}

migrateToLatest();
