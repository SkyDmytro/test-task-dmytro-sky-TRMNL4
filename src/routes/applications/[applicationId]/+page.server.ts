import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types.js';
import { repo } from '$lib/server/repo.server.js';
import { updateApplicationStatus } from '$lib/server/applications-service.js';
import { isApplicationStatus } from '$lib/shared/application.js';
import { parseNumericId } from '$lib/shared/parse.js';

export const load: PageServerLoad = async ({ params }) => {
	const applicationId = parseNumericId(params.applicationId);
	if (applicationId === null) throw error(404, 'Not found');

	const application = await repo.getApplicationById(applicationId);
	if (!application) throw error(404, 'Not found');

	return { application };
};

export const actions: Actions = {
	updateStatus: async ({ request, params }) => {
		const applicationId = parseNumericId(params.applicationId);
		if (applicationId === null) throw error(404, 'Not found');

		const formData = await request.formData();
		const statusRaw = formData.get('status');
		if (!isApplicationStatus(statusRaw)) return fail(400, { message: 'Invalid status' });

		const affected = await updateApplicationStatus(repo, {
			applicationId,
			status: statusRaw
		});
		if (affected === 0) return fail(404, { message: 'Application not found' });

		throw redirect(303, `/applications/${applicationId}`);
	}
};
