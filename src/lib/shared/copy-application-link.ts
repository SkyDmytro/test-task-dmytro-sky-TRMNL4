export function getApplicationShareUrl(applicationId: number): string {
	if (typeof window === 'undefined') return '';
	const path = `/applications/${applicationId}`;
	return `${window.location.origin}${path}`;
}

export function copyApplicationLink(applicationId: number): Promise<void> {
	const url = getApplicationShareUrl(applicationId) || `/applications/${applicationId}`;
	return navigator.clipboard.writeText(url);
}
