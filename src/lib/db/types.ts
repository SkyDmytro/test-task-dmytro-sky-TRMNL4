export type ApplicationStatus = 'new' | 'reviewed' | 'accepted' | 'rejected';

export interface Database {
	program: {
		id: number;
		name: string;
		is_active: number;
	};
	application: {
		id: number;
		program_id: number;
		founder_name: string;
		email: string;
		startup_name: string;
		created_at: Date;
		status: ApplicationStatus;
	};
}
