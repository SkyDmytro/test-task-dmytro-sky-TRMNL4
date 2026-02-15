export function submitStatusForm(formEl: HTMLFormElement | undefined, newStatus: string): void {
	if (!formEl) return;
	const statusInput = formEl.elements.namedItem('status') as HTMLInputElement | null;
	if (statusInput) {
		statusInput.value = newStatus;
		formEl.requestSubmit();
	}
}
