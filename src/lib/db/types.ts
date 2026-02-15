import type { Generated } from 'kysely';
import type { ApplicationStatus } from '$lib/shared/application.js';

export type MysqlBoolean = 0 | 1;

export interface Database {
	program: {
		id: Generated<number>;
		name: string;
		is_active: MysqlBoolean;
	};
	application: {
		id: Generated<number>;
		program_id: number;
		founder_name: string;
		email: string;
		startup_name: string;
		created_at: Generated<Date>;
		status: ApplicationStatus;
	};
}
