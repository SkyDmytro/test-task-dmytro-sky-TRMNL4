export function parseNumericId(value: unknown): number | null {
	if (typeof value !== 'string') return null;
	if (!/^[0-9]+$/.test(value)) return null;
	const parsed = Number(value);
	if (!Number.isSafeInteger(parsed)) return null;
	return parsed;
}
