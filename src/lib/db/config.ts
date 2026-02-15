const REQUIRED_KEYS = ['DB_USER', 'DB_PASSWORD'] as const;

function assertRequiredDbKeys(
	env: Record<string, string | undefined>
): asserts env is Record<(typeof REQUIRED_KEYS)[number], string> &
	Record<string, string | undefined> {
	for (const key of REQUIRED_KEYS) {
		const value = env[key];
		if (value === undefined || value === '') throw new Error(`Missing required DB config: ${key}`);
	}
}

export function createDbConfig(env: Record<string, string | undefined>) {
	assertRequiredDbKeys(env);
	const portRaw = env.DB_PORT ? Number(env.DB_PORT) : 3306;
	const port = Number.isInteger(portRaw) && portRaw > 0 && portRaw < 65536 ? portRaw : 3306;
	return {
		host: env.DB_HOST ?? 'localhost',
		port,
		database: env.DB_NAME ?? 'app',
		user: env.DB_USER,
		password: env.DB_PASSWORD
	};
}
