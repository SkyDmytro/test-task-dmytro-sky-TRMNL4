import type { ApplicationStatus } from '$lib/db/types.js';
import type { ApplicationsRepository, ProgramListItem } from './applications-repository.js';
import { parseNumericId } from '$lib/shared/parse.js';

export async function updateApplicationStatus(
	repo: ApplicationsRepository,
	input: { applicationId: number; status: ApplicationStatus }
): Promise<number> {
	return repo.updateApplicationStatus(input);
}

export function pickSelectedProgramId(input: {
	programIdParam: string | null;
	programs: ProgramListItem[];
}): number | null {
	const parsed = parseNumericId(input.programIdParam);
	if (parsed !== null && input.programs.some((p) => p.id === parsed)) return parsed;
	return input.programs[0]?.id ?? null;
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
