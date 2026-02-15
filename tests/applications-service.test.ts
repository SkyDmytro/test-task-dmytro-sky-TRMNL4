import { it, expect } from 'vitest';
import type {
	ApplicationListItem,
	ApplicationsRepository,
	ListApplicationsOptions
} from '$lib/server/applications-repository.js';
import {
	getApplicationsListRedirectUrl,
	loadApplicationsOverview,
	pickSelectedProgramId
} from '$lib/server/applications-service.js';
import {
	applicationStatuses,
	isApplicationStatus,
	type ApplicationStatus
} from '$lib/shared/application.js';
import { APPLICATIONS_PAGE_SIZE } from '$lib/constants.js';
import {
	clampPage,
	normalizeListParams,
	type ApplicationsListParamsRaw
} from '$lib/applications-list-query.js';

function makeRaw(overrides?: Partial<ApplicationsListParamsRaw>): ApplicationsListParamsRaw {
	return {
		programIdParam: null,
		pageParam: null,
		statusParam: null,
		dateFromParam: null,
		dateToParam: null,
		searchParam: null,
		...overrides
	};
}

it('applicationStatuses contains all allowed statuses', () => {
	const expected: readonly ApplicationStatus[] = ['new', 'reviewed', 'accepted', 'rejected'];
	expect(applicationStatuses).toEqual(expected);
});

it('isApplicationStatus validates allowed values', () => {
	expect(isApplicationStatus('new')).toBe(true);
	expect(isApplicationStatus('reviewed')).toBe(true);
	expect(isApplicationStatus('accepted')).toBe(true);
	expect(isApplicationStatus('rejected')).toBe(true);
	expect(isApplicationStatus('invalid')).toBe(false);
	expect(isApplicationStatus(null)).toBe(false);
});

it('pickSelectedProgramId uses programIdParam when it exists', () => {
	const programs = [
		{ id: 10, name: 'A', isActive: true },
		{ id: 20, name: 'B', isActive: true }
	];
	expect(pickSelectedProgramId({ programIdParam: '20', programs })).toBe(20);
});

it('pickSelectedProgramId falls back to first program', () => {
	const programs = [
		{ id: 10, name: 'A', isActive: true },
		{ id: 20, name: 'B', isActive: true }
	];
	expect(pickSelectedProgramId({ programIdParam: '999', programs })).toBe(10);
	expect(pickSelectedProgramId({ programIdParam: 'abc', programs })).toBe(10);
	expect(pickSelectedProgramId({ programIdParam: null, programs })).toBe(10);
});

it('pickSelectedProgramId returns null when no programs exist', () => {
	expect(pickSelectedProgramId({ programIdParam: '1', programs: [] })).toBeNull();
});

it('clampPage clamps to valid range', () => {
	expect(clampPage(0, 5)).toBe(1);
	expect(clampPage(1, 5)).toBe(1);
	expect(clampPage(3, 5)).toBe(3);
	expect(clampPage(6, 5)).toBe(5);
	expect(clampPage(10, 0)).toBe(1);
});

it('normalizeListParams swaps dateFrom > dateTo', () => {
	const result = normalizeListParams(
		makeRaw({ dateFromParam: '2025-02-01', dateToParam: '2025-01-01' }),
		1
	);
	expect(result.dateFrom!.getTime()).toBeLessThan(result.dateTo!.getTime());
	expect(result.dateFromInputValue).toBe('2025-01-01');
	expect(result.dateToInputValue).toBe('2025-02-01');
});

it('normalizeListParams ignores invalid status', () => {
	const result = normalizeListParams(makeRaw({ statusParam: 'bogus' }), 1);
	expect(result.status).toBeUndefined();
});

it('normalizeListParams trims search and converts empty to undefined', () => {
	expect(normalizeListParams(makeRaw({ searchParam: '   ' }), 1).search).toBeUndefined();
	expect(normalizeListParams(makeRaw({ searchParam: ' foo ' }), 1).search).toBe('foo');
});

function createMockRepo(overrides?: Partial<ApplicationsRepository>): ApplicationsRepository {
	return {
		async listPrograms() {
			return [];
		},
		async listApplicationsByProgramId() {
			return { items: [], total: 0 };
		},
		async getApplicationById() {
			return null;
		},
		async updateApplicationStatus() {
			return 0;
		},
		...overrides
	};
}

it('loadApplicationsOverview uses selected program and lists applications', async () => {
	const calls: Array<{ programId: number; options: ListApplicationsOptions }> = [];

	const repo = createMockRepo({
		async listPrograms() {
			return [
				{ id: 1, name: 'P1', isActive: true },
				{ id: 2, name: 'P2', isActive: true }
			];
		},
		async listApplicationsByProgramId(programId: number, options: ListApplicationsOptions) {
			calls.push({ programId, options });
			return {
				items: [
					{
						id: 123,
						programId,
						founderName: 'Founder',
						email: 'a@b.com',
						startupName: 'Startup',
						createdAt: new Date('2025-01-01T00:00:00.000Z'),
						status: 'new' as ApplicationStatus
					}
				],
				total: 1
			};
		}
	});

	const result = await loadApplicationsOverview(repo, makeRaw({ programIdParam: '2' }));
	expect(result.selectedProgramId).toBe(2);
	expect(calls).toHaveLength(1);
	expect(calls[0]?.programId).toBe(2);
	expect(result.applications[0]?.programId).toBe(2);
	expect(result.total).toBe(1);
	expect(result.page).toBe(1);
	expect(result.pageSize).toBe(APPLICATIONS_PAGE_SIZE);
});

it('loadApplicationsOverview does not list applications when there are no programs', async () => {
	let listApplicationsCalls = 0;

	const repo = createMockRepo({
		async listApplicationsByProgramId() {
			listApplicationsCalls += 1;
			return { items: [], total: 0 };
		}
	});

	const result = await loadApplicationsOverview(repo, makeRaw({ programIdParam: '1' }));
	expect(result.selectedProgramId).toBeNull();
	expect(listApplicationsCalls).toBe(0);
});

it('loadApplicationsOverview passes pagination and filters to repo', async () => {
	const calls: Array<{ programId: number; options: ListApplicationsOptions }> = [];

	const repo = createMockRepo({
		async listPrograms() {
			return [{ id: 1, name: 'P1', isActive: true }];
		},
		async listApplicationsByProgramId(programId: number, options: ListApplicationsOptions) {
			calls.push({ programId, options });
			return { items: [], total: 0 };
		}
	});

	await loadApplicationsOverview(
		repo,
		makeRaw({
			programIdParam: '1',
			pageParam: '2',
			statusParam: 'accepted',
			dateFromParam: '2025-01-01',
			dateToParam: '2025-02-01',
			searchParam: 'foo'
		})
	);

	expect(calls).toHaveLength(1);
	expect(calls[0]?.programId).toBe(1);
	expect(calls[0]?.options).toEqual({
		limit: APPLICATIONS_PAGE_SIZE,
		offset: APPLICATIONS_PAGE_SIZE,
		status: 'accepted',
		dateFrom: new Date(Date.UTC(2025, 0, 1)),
		dateTo: new Date(Date.UTC(2025, 1, 1)),
		search: 'foo'
	});
});

it('loadApplicationsOverview defaults page to 1 and ignores invalid params', async () => {
	const calls: Array<{ options: ListApplicationsOptions }> = [];

	const repo = createMockRepo({
		async listPrograms() {
			return [{ id: 1, name: 'P1', isActive: true }];
		},
		async listApplicationsByProgramId(_programId, options: ListApplicationsOptions) {
			calls.push({ options });
			return { items: [], total: 0 };
		}
	});

	const result = await loadApplicationsOverview(
		repo,
		makeRaw({
			programIdParam: '1',
			pageParam: '0',
			statusParam: 'invalid',
			searchParam: '   '
		})
	);

	expect(result.page).toBe(1);
	expect(calls[0]?.options).toEqual({
		limit: APPLICATIONS_PAGE_SIZE,
		offset: 0,
		status: undefined,
		dateFrom: undefined,
		dateTo: undefined,
		search: undefined
	});
});

it('loadApplicationsOverview clamps page and refetches items', async () => {
	const calls: Array<{ options: ListApplicationsOptions }> = [];
	const item: ApplicationListItem = {
		id: 1,
		programId: 1,
		founderName: 'F',
		email: 'f@x.com',
		startupName: 'S',
		createdAt: new Date('2025-01-01T00:00:00.000Z'),
		status: 'new' as ApplicationStatus
	};

	const repo = createMockRepo({
		async listPrograms() {
			return [{ id: 1, name: 'P1', isActive: true }];
		},
		async listApplicationsByProgramId(_programId: number, options: ListApplicationsOptions) {
			calls.push({ options });
			if (options.offset === 0) return { items: [item], total: 3 };
			return { items: [], total: 3 };
		}
	});

	const result = await loadApplicationsOverview(
		repo,
		makeRaw({ programIdParam: '1', pageParam: '999' })
	);

	expect(result.page).toBe(1);
	expect(result.total).toBe(3);
	expect(result.applications).toHaveLength(1);
	expect(result.applications[0]?.id).toBe(1);
	expect(calls).toHaveLength(2);
	expect(calls[1]?.options.offset).toBe(0);
});

it('getApplicationsListRedirectUrl preserves and normalizes list params', async () => {
	const repo = createMockRepo({
		async listPrograms() {
			return [{ id: 1, name: 'P1', isActive: true }];
		}
	});

	const url = await getApplicationsListRedirectUrl(repo, {
		programIdFromForm: 1,
		programIdParamFromForm: '1',
		programIdParamFromUrl: null,
		raw: makeRaw({
			pageParam: '2',
			statusParam: 'accepted',
			dateFromParam: '2025-01-01',
			dateToParam: '2025-02-01',
			searchParam: 'query'
		})
	});

	const parsed = new URL(url, 'http://test');
	expect(parsed.searchParams.get('programId')).toBe('1');
	expect(parsed.searchParams.get('page')).toBe('2');
	expect(parsed.searchParams.get('status')).toBe('accepted');
	expect(parsed.searchParams.get('dateFrom')).toBe('2025-01-01');
	expect(parsed.searchParams.get('dateTo')).toBe('2025-02-01');
	expect(parsed.searchParams.get('q')).toBe('query');
});

it('getApplicationsListRedirectUrl strips invalid status from redirect', async () => {
	const repo = createMockRepo({
		async listPrograms() {
			return [{ id: 1, name: 'P1', isActive: true }];
		}
	});

	const url = await getApplicationsListRedirectUrl(repo, {
		programIdFromForm: 1,
		programIdParamFromForm: '1',
		programIdParamFromUrl: null,
		raw: makeRaw({ statusParam: 'bogus' })
	});

	const parsed = new URL(url, 'http://test');
	expect(parsed.searchParams.has('status')).toBe(false);
});
