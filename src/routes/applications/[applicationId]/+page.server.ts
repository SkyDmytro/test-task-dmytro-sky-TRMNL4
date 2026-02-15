import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types.js';
import { getApplicationsRepo } from '$lib/server/repo.server.js';
import { updateApplicationStatus } from '$lib/server/applications-service.js';
import { handleUpdateStatusResult } from '$lib/server/update-status-handler.js';
import { parseNumericId } from '$lib/shared/parse.js';

export const load: PageServerLoad = async ({ params }) => {
	const applicationId = parseNumericId(params.applicationId);
	if (applicationId === null) throw error(400, 'Invalid application ID');

	const application = await getApplicationsRepo().getApplicationById(applicationId);
	if (!application) throw error(404, 'Not found');

	return { application };
};

export const actions: Actions = {
	updateStatus: async ({ request, params }) => {
		const applicationId = parseNumericId(params.applicationId);
		if (applicationId === null) return fail(400, { message: 'Invalid application ID' });

		const formData = await request.formData();
		const statusRaw = formData.get('status');

		const result = await updateApplicationStatus(getApplicationsRepo(), {
			applicationId,
			status: statusRaw
		});
		const failResponse = handleUpdateStatusResult(result);
		if (failResponse) return failResponse;

		throw redirect(303, `/applications/${applicationId}`);
	}
};
