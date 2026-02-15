import type { ApplicationsRepository, ProgramListItem } from './applications-repository.js';
import { isApplicationStatus } from '$lib/shared/application.js';
import { parseNumericId } from '$lib/shared/parse.js';

export type UpdateStatusResult =
	| { ok: true; affected: number }
	| { ok: false; reason: 'invalid_status' | 'not_found' };

export async function updateApplicationStatus(
	repo: ApplicationsRepository,
	input: { applicationId: number; status: unknown }
): Promise<UpdateStatusResult> {
	if (!isApplicationStatus(input.status)) return { ok: false, reason: 'invalid_status' };
	const affected = await repo.updateApplicationStatus({
		applicationId: input.applicationId,
		status: input.status
	});
	if (affected === 0) return { ok: false, reason: 'not_found' };
	return { ok: true, affected };
}

export function pickSelectedProgramId(input: {
	programIdParam: string | null;
	programs: ProgramListItem[];
}): number | null {
	const parsed = parseNumericId(input.programIdParam);
	if (parsed !== null && input.programs.some((p) => p.id === parsed)) return parsed;
	return input.programs[0]?.id ?? null;
}

export async function getApplicationsListRedirectUrl(
	repo: ApplicationsRepository,
	input: {
		programIdFromForm: number | null;
		programIdParamFromForm: string | null;
		programIdParamFromUrl: string | null;
	}
): Promise<string> {
	if (input.programIdFromForm !== null)
		return `/applications?programId=${encodeURIComponent(String(input.programIdFromForm))}`;
	const programs = await repo.listPrograms();
	const selectedProgramId = pickSelectedProgramId({
		programIdParam: input.programIdParamFromForm ?? input.programIdParamFromUrl,
		programs
	});
	return selectedProgramId
		? `/applications?programId=${encodeURIComponent(String(selectedProgramId))}`
		: '/applications';
}

export async function loadApplicationsOverview(
	repo: ApplicationsRepository,
	input: { programIdParam: string | null }
) {
	const programs = await repo.listPrograms();
	const selectedProgramId = pickSelectedProgramId({
		programIdParam: input.programIdParam,
		programs
	});
	const applications = selectedProgramId
		? await repo.listApplicationsByProgramId(selectedProgramId)
		: [];
	return { programs, selectedProgramId, applications };
}
