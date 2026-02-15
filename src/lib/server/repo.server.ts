import type { ApplicationsRepository } from './applications-repository.js';
import { getDb } from '$lib/db/db.server.js';
import { createKyselyApplicationsRepository } from './kysely-applications-repository.server.js';

let repo: ApplicationsRepository | null = null;

export function getApplicationsRepo(): ApplicationsRepository {
	if (!repo) repo = createKyselyApplicationsRepository(getDb());
	return repo;
}
