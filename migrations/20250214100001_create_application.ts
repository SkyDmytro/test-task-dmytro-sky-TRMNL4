import { type Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
	await db.schema
		.createTable('application')
		.addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
		.addColumn('program_id', 'integer', (col) => col.notNull().references('program.id'))
		.addColumn('founder_name', 'varchar(255)', (col) => col.notNull())
		.addColumn('email', 'varchar(255)', (col) => col.notNull())
		.addColumn('startup_name', 'varchar(255)', (col) => col.notNull())
		.addColumn('created_at', 'datetime', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
		.addColumn('status', 'varchar(20)', (col) => col.notNull().defaultTo('new'))
		.execute();
	await db.schema
		.createIndex('application_program_id_idx')
		.on('application')
		.column('program_id')
		.execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
	await db.schema.dropTable('application').execute();
}
