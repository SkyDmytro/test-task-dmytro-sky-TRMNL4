import { sql, type Kysely, type SqlBool } from 'kysely';
import type { Database } from '$lib/db/types.js';
import type {
	ApplicationDetailItem,
	ApplicationListItem,
	ApplicationsRepository,
	ListApplicationsOptions,
	ListApplicationsResult,
	ProgramListItem
} from './applications-repository.js';

function escapeLike(value: string): string {
	return value.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

function applyListFilters(
	db: Kysely<Database>,
	programId: number,
	options: ListApplicationsOptions
) {
	let q = db.selectFrom('application').where('program_id', '=', programId);
	if (options.status != null) q = q.where('status', '=', options.status);
	if (options.dateFrom != null) q = q.where('created_at', '>=', options.dateFrom);
	if (options.dateTo != null) {
		const d = options.dateTo;
		const nextDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1));
		q = q.where('created_at', '<', nextDay);
	}
	if (options.search != null && options.search !== '') {
		const pattern = `%${escapeLike(options.search)}%`;
		q = q.where(
			sql<SqlBool>`(startup_name like ${pattern} escape '\\\\' or founder_name like ${pattern} escape '\\\\' or email like ${pattern} escape '\\\\')`
		);
	}
	return q;
}

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

		async listApplicationsByProgramId(
			programId: number,
			options: ListApplicationsOptions
		): Promise<ListApplicationsResult> {
			const base = applyListFilters(db, programId, options);
			const [countRow, rows] = await Promise.all([
				base.select((eb) => eb.fn.count('id').as('count')).executeTakeFirst(),
				base
					.select([
						'id',
						'program_id',
						'founder_name',
						'email',
						'startup_name',
						'created_at',
						'status'
					])
					.orderBy('created_at', 'desc')
					.limit(options.limit)
					.offset(options.offset)
					.execute()
			]);
			const total = Number(countRow?.count ?? 0);

			return {
				total: Number.isFinite(total) ? total : 0,
				items: rows.map(
					(row): ApplicationListItem => ({
						id: row.id,
						programId: row.program_id,
						founderName: row.founder_name,
						email: row.email,
						startupName: row.startup_name,
						createdAt: row.created_at,
						status: row.status
					})
				)
			};
		},

		async getApplicationById(applicationId: number): Promise<ApplicationDetailItem | null> {
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
