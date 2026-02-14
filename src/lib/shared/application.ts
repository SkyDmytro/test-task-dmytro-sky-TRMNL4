import type { ApplicationStatus } from '$lib/db/types.js';

export const applicationStatuses = [
	'new',
	'reviewed',
	'accepted',
	'rejected'
] as const satisfies readonly ApplicationStatus[];

export function isApplicationStatus(value: unknown): value is ApplicationStatus {
	return typeof value === 'string' && (applicationStatuses as readonly string[]).includes(value);
}
