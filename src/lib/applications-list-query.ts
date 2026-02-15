import type { ApplicationStatus } from '$lib/shared/application.js';
import { isApplicationStatus } from '$lib/shared/application.js';
import { APPLICATIONS_SEARCH_PARAM_NAME } from '$lib/constants.js';
import { parseDateOnly, parseNumericId } from '$lib/shared/parse.js';

export interface NormalizedApplicationsListParams {
	programId: number | null;
	page: number;
	status: ApplicationStatus | undefined;
	dateFrom: Date | undefined;
	dateTo: Date | undefined;
	dateFromInputValue: string | undefined;
	dateToInputValue: string | undefined;
	search: string | undefined;
}

export interface ApplicationsListQueryParams {
	programId?: number;
	page?: number;
	status?: ApplicationStatus;
	dateFrom?: string;
	dateTo?: string;
	search?: string;
}

export interface ApplicationsListParamsRaw {
	programIdParam: string | null;
	pageParam: string | null;
	statusParam: string | null;
	dateFromParam: string | null;
	dateToParam: string | null;
	searchParam: string | null;
}

export function extractApplicationsListParamsRaw(
	searchParams: URLSearchParams
): ApplicationsListParamsRaw {
	return {
		programIdParam: searchParams.get('programId'),
		pageParam: searchParams.get('page'),
		statusParam: searchParams.get('status'),
		dateFromParam: searchParams.get('dateFrom'),
		dateToParam: searchParams.get('dateTo'),
		searchParam: searchParams.get(APPLICATIONS_SEARCH_PARAM_NAME)
	};
}

export function normalizeListParams(
	raw: ApplicationsListParamsRaw,
	selectedProgramId: number | null
): NormalizedApplicationsListParams {
	const pageRaw = parseNumericId(raw.pageParam);
	const page = pageRaw != null && pageRaw >= 1 ? pageRaw : 1;
	const status =
		raw.statusParam != null && isApplicationStatus(raw.statusParam) ? raw.statusParam : undefined;
	let dateFrom = parseDateOnly(raw.dateFromParam) ?? undefined;
	let dateTo = parseDateOnly(raw.dateToParam) ?? undefined;
	let dateFromRaw = raw.dateFromParam ?? undefined;
	let dateToRaw = raw.dateToParam ?? undefined;
	if (dateFrom != null && dateTo != null && dateFrom.getTime() > dateTo.getTime()) {
		[dateFrom, dateTo] = [dateTo, dateFrom];
		[dateFromRaw, dateToRaw] = [dateToRaw, dateFromRaw];
	}
	const trimmed = raw.searchParam?.trim();
	const search = trimmed && trimmed.length > 0 ? trimmed : undefined;

	return {
		programId: selectedProgramId,
		page,
		status,
		dateFrom,
		dateTo,
		dateFromInputValue: dateFrom != null ? dateFromRaw : undefined,
		dateToInputValue: dateTo != null ? dateToRaw : undefined,
		search
	};
}

export function clampPage(page: number, totalPages: number): number {
	if (totalPages <= 0) return 1;
	return Math.max(1, Math.min(page, totalPages));
}

export function buildApplicationsListQueryString(params: ApplicationsListQueryParams): string {
	const sp = new URLSearchParams();
	if (params.programId != null) sp.set('programId', String(params.programId));
	if (params.page != null && params.page > 1) sp.set('page', String(params.page));
	if (params.status != null) sp.set('status', params.status);
	if (params.dateFrom != null && params.dateFrom !== '') sp.set('dateFrom', params.dateFrom);
	if (params.dateTo != null && params.dateTo !== '') sp.set('dateTo', params.dateTo);
	if (params.search != null && params.search !== '')
		sp.set(APPLICATIONS_SEARCH_PARAM_NAME, params.search);
	return sp.toString();
}

export function applicationsListPath(query: string): string {
	return query ? `/applications?${query}` : '/applications';
}

export function buildNormalizedQueryParams(
	normalized: NormalizedApplicationsListParams
): ApplicationsListQueryParams {
	return {
		programId: normalized.programId ?? undefined,
		page: normalized.page,
		status: normalized.status,
		dateFrom: normalized.dateFromInputValue,
		dateTo: normalized.dateToInputValue,
		search: normalized.search
	};
}
