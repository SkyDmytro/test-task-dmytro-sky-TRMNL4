import { createPool } from 'mysql2';
import { Kysely, MysqlDialect } from 'kysely';
import type { Database } from '../src/lib/db/types.js';

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

async function seed() {
	await db
		.insertInto('program')
		.values([
			{ name: 'Accelerator 2025', is_active: 1 },
			{ name: 'Seed Stage Program', is_active: 1 },
			{ name: 'Growth Lab', is_active: 0 }
		])
		.execute();

	await db
		.insertInto('application')
		.values([
			{
				program_id: 1,
				founder_name: 'Alex Chen',
				email: 'alex.chen@gmail.com',
				startup_name: 'TechFlow',
				status: 'new'
			},
			{
				program_id: 1,
				founder_name: 'Jordan Lee',
				email: 'jordan.lee@outlook.com',
				startup_name: 'GreenScale',
				status: 'reviewed'
			},
			{
				program_id: 1,
				founder_name: 'Sam Rivera',
				email: 'sam.rivera@startup.io',
				startup_name: 'DataPulse',
				status: 'accepted'
			},
			{
				program_id: 2,
				founder_name: 'Casey Morgan',
				email: 'casey.morgan@company.com',
				startup_name: 'CloudNine',
				status: 'new'
			},
			{
				program_id: 2,
				founder_name: 'Riley Kim',
				email: 'riley.kim@yahoo.com',
				startup_name: 'HealthTrack',
				status: 'rejected'
			},
			{
				program_id: 1,
				founder_name: 'James Wilson',
				email: 'james.wilson@gmail.com',
				startup_name: 'PayBridge',
				status: 'new'
			},
			{
				program_id: 1,
				founder_name: 'Emma Davis',
				email: 'emma.davis@outlook.com',
				startup_name: 'EduLearn',
				status: 'reviewed'
			},
			{
				program_id: 1,
				founder_name: 'Michael Brown',
				email: 'michael.brown@startup.com',
				startup_name: 'LogiFlow',
				status: 'accepted'
			},
			{
				program_id: 1,
				founder_name: 'Sarah Miller',
				email: 'sarah.miller@gmail.com',
				startup_name: 'FitTrack',
				status: 'rejected'
			},
			{
				program_id: 2,
				founder_name: 'David Garcia',
				email: 'david.garcia@company.co',
				startup_name: 'SecureVault',
				status: 'new'
			},
			{
				program_id: 2,
				founder_name: 'Jessica Martinez',
				email: 'jessica.martinez@yahoo.com',
				startup_name: 'FoodDash',
				status: 'new'
			},
			{
				program_id: 2,
				founder_name: 'Christopher Anderson',
				email: 'chris.anderson@gmail.com',
				startup_name: 'CleanTech',
				status: 'reviewed'
			},
			{
				program_id: 2,
				founder_name: 'Emily Taylor',
				email: 'emily.taylor@outlook.com',
				startup_name: 'StyleHub',
				status: 'accepted'
			},
			{
				program_id: 1,
				founder_name: 'Daniel Thompson',
				email: 'daniel.thompson@startup.io',
				startup_name: 'DevTools',
				status: 'new'
			},
			{
				program_id: 2,
				founder_name: 'Olivia White',
				email: 'olivia.white@gmail.com',
				startup_name: 'PetCare',
				status: 'rejected'
			},
			{
				program_id: 1,
				founder_name: 'Matthew Harris',
				email: 'matt.harris@company.com',
				startup_name: 'AnalyticsPro',
				status: 'reviewed'
			},
			{
				program_id: 2,
				founder_name: 'Sophia Clark',
				email: 'sophia.clark@yahoo.com',
				startup_name: 'TravelEase',
				status: 'new'
			},
			{
				program_id: 1,
				founder_name: 'Andrew Lewis',
				email: 'andrew.lewis@gmail.com',
				startup_name: 'MedTech',
				status: 'accepted'
			},
			{
				program_id: 2,
				founder_name: 'Isabella Robinson',
				email: 'isabella.robinson@outlook.com',
				startup_name: 'EventSpace',
				status: 'new'
			}
		])
		.execute();

	console.log('Seed completed');
	await db.destroy();
}

seed().catch((err) => {
	console.error(err);
	process.exit(1);
});
