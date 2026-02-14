import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types.js';
import { repo } from '$lib/server/repo.server.js';
import {
	loadApplicationsOverview,
	updateApplicationStatus
} from '$lib/server/applications-service.js';
import { isApplicationStatus } from '$lib/shared/application.js';
import { parseNumericId } from '$lib/shared/parse.js';

export const load: PageServerLoad = async ({ url }) => {
	return loadApplicationsOverview(repo, {
		programIdParam: url.searchParams.get('programId')
	});
};

export const actions: Actions = {
	updateStatus: async ({ request, url }) => {
		const formData = await request.formData();
		const applicationId = parseNumericId(formData.get('applicationId'));
		const statusRaw = formData.get('status');
		const programIdRaw = formData.get('programId');

		if (applicationId === null) return fail(400, { message: 'Invalid application ID' });
		if (!isApplicationStatus(statusRaw)) return fail(400, { message: 'Invalid status' });

		const affected = await updateApplicationStatus(repo, {
			applicationId,
			status: statusRaw
		});
		if (affected === 0) return fail(404, { message: 'Application not found' });

		const programId =
			parseNumericId(programIdRaw) ?? parseNumericId(url.searchParams.get('programId'));
		const next = programId
			? `/applications?programId=${encodeURIComponent(String(programId))}`
			: '/applications';

		throw redirect(303, next);
	}
};
