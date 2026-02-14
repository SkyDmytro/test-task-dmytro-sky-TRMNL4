import type { Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await db.schema
		.createTable('program')
		.addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
		.addColumn('name', 'varchar(255)', (col) => col.notNull())
		.addColumn('is_active', 'boolean', (col) => col.notNull().defaultTo(true))
		.execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema.dropTable('program').execute();
}
