import 'dotenv/config';
import { createPool } from 'mysql2';
import { Kysely, MysqlDialect } from 'kysely';
import type { Database } from '../src/lib/db/types.js';
import { createDbConfig } from '../src/lib/db/config.js';

const db = new Kysely<Database>({
	dialect: new MysqlDialect({
		pool: createPool(createDbConfig(process.env))
	})
});

async function seed() {
	await db.transaction().execute(async (trx) => {
		await trx.deleteFrom('application').execute();
		await trx.deleteFrom('program').execute();

		await trx
			.insertInto('program')
			.values([
				{ name: 'Accelerator 2025', is_active: 1 },
				{ name: 'Seed Stage Program', is_active: 1 },
				{ name: 'Growth Lab', is_active: 0 }
			])
			.execute();

		const programs = await trx.selectFrom('program').select(['id', 'name']).execute();
		const idByName = new Map(programs.map((p) => [p.name, p.id]));
		const acceleratorId = idByName.get('Accelerator 2025')!;
		const seedStageId = idByName.get('Seed Stage Program')!;

		await trx
			.insertInto('application')
			.values([
				{
					program_id: acceleratorId,
					founder_name: 'Alex Chen',
					email: 'alex.chen@gmail.com',
					startup_name: 'TechFlow',
					status: 'new'
				},
				{
					program_id: acceleratorId,
					founder_name: 'Jordan Lee',
					email: 'jordan.lee@outlook.com',
					startup_name: 'GreenScale',
					status: 'reviewed'
				},
				{
					program_id: acceleratorId,
					founder_name: 'Sam Rivera',
					email: 'sam.rivera@startup.io',
					startup_name: 'DataPulse',
					status: 'accepted'
				},
				{
					program_id: seedStageId,
					founder_name: 'Casey Morgan',
					email: 'casey.morgan@company.com',
					startup_name: 'CloudNine',
					status: 'new'
				},
				{
					program_id: seedStageId,
					founder_name: 'Riley Kim',
					email: 'riley.kim@yahoo.com',
					startup_name: 'HealthTrack',
					status: 'rejected'
				},
				{
					program_id: acceleratorId,
					founder_name: 'James Wilson',
					email: 'james.wilson@gmail.com',
					startup_name: 'PayBridge',
					status: 'new'
				},
				{
					program_id: acceleratorId,
					founder_name: 'Emma Davis',
					email: 'emma.davis@outlook.com',
					startup_name: 'EduLearn',
					status: 'reviewed'
				},
				{
					program_id: acceleratorId,
					founder_name: 'Michael Brown',
					email: 'michael.brown@startup.com',
					startup_name: 'LogiFlow',
					status: 'accepted'
				},
				{
					program_id: acceleratorId,
					founder_name: 'Sarah Miller',
					email: 'sarah.miller@gmail.com',
					startup_name: 'FitTrack',
					status: 'rejected'
				},
				{
					program_id: seedStageId,
					founder_name: 'David Garcia',
					email: 'david.garcia@company.co',
					startup_name: 'SecureVault',
					status: 'new'
				},
				{
					program_id: seedStageId,
					founder_name: 'Jessica Martinez',
					email: 'jessica.martinez@yahoo.com',
					startup_name: 'FoodDash',
					status: 'new'
				},
				{
					program_id: seedStageId,
					founder_name: 'Christopher Anderson',
					email: 'chris.anderson@gmail.com',
					startup_name: 'CleanTech',
					status: 'reviewed'
				},
				{
					program_id: seedStageId,
					founder_name: 'Emily Taylor',
					email: 'emily.taylor@outlook.com',
					startup_name: 'StyleHub',
					status: 'accepted'
				},
				{
					program_id: acceleratorId,
					founder_name: 'Daniel Thompson',
					email: 'daniel.thompson@startup.io',
					startup_name: 'DevTools',
					status: 'new'
				},
				{
					program_id: seedStageId,
					founder_name: 'Olivia White',
					email: 'olivia.white@gmail.com',
					startup_name: 'PetCare',
					status: 'rejected'
				},
				{
					program_id: acceleratorId,
					founder_name: 'Matthew Harris',
					email: 'matt.harris@company.com',
					startup_name: 'AnalyticsPro',
					status: 'reviewed'
				},
				{
					program_id: seedStageId,
					founder_name: 'Sophia Clark',
					email: 'sophia.clark@yahoo.com',
					startup_name: 'TravelEase',
					status: 'new'
				},
				{
					program_id: acceleratorId,
					founder_name: 'Andrew Lewis',
					email: 'andrew.lewis@gmail.com',
					startup_name: 'MedTech',
					status: 'accepted'
				},
				{
					program_id: seedStageId,
					founder_name: 'Isabella Robinson',
					email: 'isabella.robinson@outlook.com',
					startup_name: 'EventSpace',
					status: 'new'
				}
			])
			.execute();
	});

	console.log('Seed completed');
	await db.destroy();
}

seed().catch((err) => {
	console.error(err);
	process.exit(1);
});
