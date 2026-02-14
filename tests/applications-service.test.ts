import { it, expect } from 'vitest';
import type { ApplicationStatus } from '$lib/db/types.js';
import type { ApplicationsRepository } from '$lib/server/applications-repository.js';
import {
	loadApplicationsOverview,
	pickSelectedProgramId
} from '$lib/server/applications-service.js';
import { applicationStatuses, isApplicationStatus } from '$lib/shared/application.js';
import { parseNumericId } from '$lib/shared/parse.js';

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

it('parseNumericId parses valid integers', () => {
	expect(parseNumericId('123')).toBe(123);
	expect(parseNumericId('0')).toBe(0);
});

it('parseNumericId rejects invalid input', () => {
	expect(parseNumericId(null)).toBeNull();
	expect(parseNumericId(undefined)).toBeNull();
	expect(parseNumericId('')).toBeNull();
	expect(parseNumericId('abc')).toBeNull();
	expect(parseNumericId('12.5')).toBeNull();
	expect(parseNumericId('-1')).toBeNull();
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

function createMockRepo(overrides?: Partial<ApplicationsRepository>): ApplicationsRepository {
	return {
		async listPrograms() {
			return [];
		},
		async listApplicationsByProgramId() {
			return [];
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
	const calls: Array<{ programId: number }> = [];

	const repo = createMockRepo({
		async listPrograms() {
			return [
				{ id: 1, name: 'P1', isActive: true },
				{ id: 2, name: 'P2', isActive: true }
			];
		},
		async listApplicationsByProgramId(programId: number) {
			calls.push({ programId });
			return [
				{
					id: 123,
					programId,
					founderName: 'Founder',
					email: 'a@b.com',
					startupName: 'Startup',
					createdAt: new Date('2025-01-01T00:00:00.000Z'),
					status: 'new' as ApplicationStatus
				}
			];
		}
	});

	const result = await loadApplicationsOverview(repo, { programIdParam: '2' });
	expect(result.selectedProgramId).toBe(2);
	expect(calls).toHaveLength(1);
	expect(calls[0]?.programId).toBe(2);
	expect(result.applications[0]?.programId).toBe(2);
});

it('loadApplicationsOverview does not list applications when there are no programs', async () => {
	let listApplicationsCalls = 0;

	const repo = createMockRepo({
		async listApplicationsByProgramId() {
			listApplicationsCalls += 1;
			return [];
		}
	});

	const result = await loadApplicationsOverview(repo, { programIdParam: '1' });
	expect(result.selectedProgramId).toBeNull();
	expect(listApplicationsCalls).toBe(0);
});
