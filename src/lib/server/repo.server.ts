import { db } from '$lib/db/db.server.js';
import { createKyselyApplicationsRepository } from './kysely-applications-repository.server.js';

export const repo = createKyselyApplicationsRepository(db);
