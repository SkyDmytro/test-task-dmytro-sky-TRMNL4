import type { Kysely } from 'kysely';
import type { Database } from '$lib/db/types.js';
import type {
	ApplicationDetailItem,
	ApplicationListItem,
	ApplicationsRepository,
	ProgramListItem
} from './applications-repository.js';

export function createKyselyApplicationsRepository(db: Kysely<Database>): ApplicationsRepository {
	return {
		async listPrograms(): Promise<ProgramListItem[]> {
			const rows = await db
				.selectFrom('program')
				.select(['id', 'name', 'is_active'])
				.orderBy('is_active', 'desc')
				.orderBy('name', 'asc')
				.execute();

			return rows.map((row) => ({
				id: row.id,
				name: row.name,
				isActive: Boolean(row.is_active)
			}));
		},

		async listApplicationsByProgramId(programId): Promise<ApplicationListItem[]> {
			const rows = await db
				.selectFrom('application')
				.select([
					'id',
					'program_id',
					'founder_name',
					'email',
					'startup_name',
					'created_at',
					'status'
				])
				.where('program_id', '=', programId)
				.orderBy('created_at', 'desc')
				.execute();

			return rows.map(
				(row): ApplicationListItem => ({
					id: row.id,
					programId: row.program_id,
					founderName: row.founder_name,
					email: row.email,
					startupName: row.startup_name,
					createdAt: row.created_at,
					status: row.status
				})
			);
		},

		async getApplicationById(applicationId): Promise<ApplicationDetailItem | null> {
			const row = await db
				.selectFrom('application')
				.innerJoin('program', 'program.id', 'application.program_id')
				.select([
					'application.id as id',
					'application.program_id as program_id',
					'application.founder_name as founder_name',
					'application.email as email',
					'application.startup_name as startup_name',
					'application.created_at as created_at',
					'application.status as status',
					'program.name as program_name',
					'program.is_active as program_is_active'
				])
				.where('application.id', '=', applicationId)
				.executeTakeFirst();

			if (!row) return null;

			return {
				id: row.id,
				programId: row.program_id,
				founderName: row.founder_name,
				email: row.email,
				startupName: row.startup_name,
				createdAt: row.created_at,
				status: row.status,
				programName: row.program_name,
				programIsActive: Boolean(row.program_is_active)
			};
		},

		async updateApplicationStatus(input): Promise<number> {
			const result = await db
				.updateTable('application')
				.set({ status: input.status })
				.where('id', '=', input.applicationId)
				.executeTakeFirst();
			return Number(result.numUpdatedRows);
		}
	};
}
