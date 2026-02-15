import { fail } from '@sveltejs/kit';
import type { UpdateStatusResult } from './applications-service.js';

export const UPDATE_STATUS_MESSAGES = {
	invalid_status: 'Invalid status',
	not_found: 'Application not found'
} as const;

export function handleUpdateStatusResult(
	result: UpdateStatusResult
): ReturnType<typeof fail> | null {
	if (result.ok) return null;
	if (result.reason === 'invalid_status')
		return fail(400, { message: UPDATE_STATUS_MESSAGES.invalid_status });
	return fail(404, { message: UPDATE_STATUS_MESSAGES.not_found });
}
