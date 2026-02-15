import 'dotenv/config';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import { Migrator, FileMigrationProvider } from 'kysely';
import { getDb } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function migrateToLatest() {
	const db = getDb();

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

migrateToLatest().catch((err) => {
	console.error(err);
	process.exit(1);
});
