export function parseNumericId(value: unknown): number | null {
	if (typeof value !== 'string') return null;
	if (!/^[0-9]+$/.test(value)) return null;
	const parsed = Number(value);
	if (!Number.isSafeInteger(parsed)) return null;
	return parsed;
}

export function parseDateOnly(value: unknown): Date | null {
	if (typeof value !== 'string' || value.trim() === '') return null;
	const s = value.trim();
	if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
	const [y, m, d] = s.split('-').map(Number);
	const parsed = new Date(Date.UTC(y, m - 1, d));
	if (parsed.getUTCFullYear() !== y || parsed.getUTCMonth() !== m - 1 || parsed.getUTCDate() !== d)
		return null;
	return parsed;
}
