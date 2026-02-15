import type { ApplicationStatus } from '$lib/shared/application.js';

export interface ProgramListItem {
	id: number;
	name: string;
	isActive: boolean;
}

export interface ApplicationListItem {
	id: number;
	programId: number;
	founderName: string;
	email: string;
	startupName: string;
	createdAt: Date;
	status: ApplicationStatus;
}

export interface ApplicationDetailItem extends ApplicationListItem {
	programName: string;
	programIsActive: boolean;
}

export interface ApplicationsRepository {
	listPrograms(): Promise<ProgramListItem[]>;
	listApplicationsByProgramId(programId: number): Promise<ApplicationListItem[]>;
	getApplicationById(applicationId: number): Promise<ApplicationDetailItem | null>;
	updateApplicationStatus(input: {
		applicationId: number;
		status: ApplicationStatus;
	}): Promise<number>;
}
