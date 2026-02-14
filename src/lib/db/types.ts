import type { Generated } from 'kysely';

export type MysqlBoolean = 0 | 1;

export type ApplicationStatus = 'new' | 'reviewed' | 'accepted' | 'rejected';

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
