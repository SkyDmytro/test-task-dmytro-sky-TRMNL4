import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types.js';
import { extractApplicationsListParamsRaw } from '$lib/applications-list-query.js';
import { getApplicationsRepo } from '$lib/server/repo.server.js';
import {
	getApplicationsListRedirectUrl,
	loadApplicationsOverview,
	updateApplicationStatus
} from '$lib/server/applications-service.js';
import { handleUpdateStatusResult } from '$lib/server/update-status-handler.js';
import { parseNumericId } from '$lib/shared/parse.js';

export const load: PageServerLoad = async ({ url }) => {
	return loadApplicationsOverview(
		getApplicationsRepo(),
		extractApplicationsListParamsRaw(url.searchParams)
	);
};

export const actions: Actions = {
	updateStatus: async ({ request, url }) => {
		const formData = await request.formData();
		const applicationId = parseNumericId(formData.get('applicationId'));
		const statusRaw = formData.get('status');
		const programIdRaw = formData.get('programId');

		if (applicationId === null) return fail(400, { message: 'Invalid application ID' });

		const repo = getApplicationsRepo();
		const result = await updateApplicationStatus(repo, {
			applicationId,
			status: statusRaw
		});
		const failResponse = handleUpdateStatusResult(result);
		if (failResponse) return failResponse;

		const programIdFromForm = parseNumericId(programIdRaw);
		const next = await getApplicationsListRedirectUrl(repo, {
			programIdFromForm,
			programIdParamFromForm: typeof programIdRaw === 'string' ? programIdRaw : null,
			programIdParamFromUrl: url.searchParams.get('programId'),
			raw: extractApplicationsListParamsRaw(url.searchParams)
		});
		throw redirect(303, next);
	}
};
