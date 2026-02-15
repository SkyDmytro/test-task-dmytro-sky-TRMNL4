function getDefaultLocale(): string {
	return typeof navigator !== 'undefined' ? navigator.language : 'en-GB';
}

export function formatDate(date: Date, locale?: string): string {
	const resolvedLocale = locale ?? getDefaultLocale();
	return date.toLocaleString(resolvedLocale, { dateStyle: 'medium', timeStyle: 'short' });
}

export function formatProgramLabel(program: { name: string; isActive: boolean } | null): string {
	if (!program) return '';
	return program.name + (program.isActive ? '' : ' (inactive)');
}
