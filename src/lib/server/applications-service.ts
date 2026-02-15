import type { ApplicationsRepository, ProgramListItem } from './applications-repository.js';
import {
	applicationsListPath,
	buildApplicationsListQueryString,
	buildNormalizedQueryParams,
	clampPage,
	normalizeListParams,
	type ApplicationsListParamsRaw,
	type NormalizedApplicationsListParams
} from '$lib/applications-list-query.js';
import { APPLICATIONS_PAGE_SIZE } from '$lib/constants.js';
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

function buildRedirectUrl(normalized: NormalizedApplicationsListParams): string {
	return applicationsListPath(
		buildApplicationsListQueryString(buildNormalizedQueryParams(normalized))
	);
}

export interface GetRedirectUrlInput {
	programIdFromForm: number | null;
	programIdParamFromForm: string | null;
	programIdParamFromUrl: string | null;
	raw: ApplicationsListParamsRaw;
}

export async function getApplicationsListRedirectUrl(
	repo: ApplicationsRepository,
	input: GetRedirectUrlInput
): Promise<string> {
	let programId: number | null = input.programIdFromForm ?? null;
	if (programId === null) {
		const programs = await repo.listPrograms();
		programId = pickSelectedProgramId({
			programIdParam: input.programIdParamFromForm ?? input.programIdParamFromUrl,
			programs
		});
	}
	const normalized = normalizeListParams(input.raw, programId);
	return buildRedirectUrl(normalized);
}

export async function loadApplicationsOverview(
	repo: ApplicationsRepository,
	raw: ApplicationsListParamsRaw
) {
	const programs = await repo.listPrograms();
	const selectedProgramId = pickSelectedProgramId({
		programIdParam: raw.programIdParam,
		programs
	});
	const normalized = normalizeListParams(raw, selectedProgramId);

	if (!selectedProgramId) {
		return {
			programs,
			selectedProgramId,
			applications: [],
			total: 0,
			page: 1,
			pageSize: APPLICATIONS_PAGE_SIZE,
			statusFilter: normalized.status,
			dateFromInputValue: normalized.dateFromInputValue,
			dateToInputValue: normalized.dateToInputValue,
			search: normalized.search
		};
	}

	const filterOptions = {
		status: normalized.status,
		dateFrom: normalized.dateFrom,
		dateTo: normalized.dateTo,
		search: normalized.search
	};
	const initialOffset = Math.max(0, (normalized.page - 1) * APPLICATIONS_PAGE_SIZE);
	const { items, total } = await repo.listApplicationsByProgramId(selectedProgramId, {
		limit: APPLICATIONS_PAGE_SIZE,
		offset: initialOffset,
		...filterOptions
	});

	const totalPages = Math.ceil(total / APPLICATIONS_PAGE_SIZE) || 1;
	const page = clampPage(normalized.page, totalPages);

	let applications = items;
	if (page !== normalized.page && total > 0) {
		const clampedOffset = Math.max(0, (page - 1) * APPLICATIONS_PAGE_SIZE);
		const refetched = await repo.listApplicationsByProgramId(selectedProgramId, {
			limit: APPLICATIONS_PAGE_SIZE,
			offset: clampedOffset,
			...filterOptions
		});
		applications = refetched.items;
	}

	return {
		programs,
		selectedProgramId,
		applications,
		total,
		page,
		pageSize: APPLICATIONS_PAGE_SIZE,
		statusFilter: normalized.status,
		dateFromInputValue: normalized.dateFromInputValue,
		dateToInputValue: normalized.dateToInputValue,
		search: normalized.search
	};
}
