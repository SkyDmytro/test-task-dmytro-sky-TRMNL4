export function createDbConfig(env: Record<string, string | undefined>) {
	return {
		host: env.DB_HOST ?? 'localhost',
		port: env.DB_PORT ? Number(env.DB_PORT) : 3306,
		database: env.DB_NAME ?? 'app',
		user: env.DB_USER,
		password: env.DB_PASSWORD
	};
}
