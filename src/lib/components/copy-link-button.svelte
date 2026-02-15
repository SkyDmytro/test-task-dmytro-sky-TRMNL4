<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { copyApplicationLink } from '$lib/shared/copy-application-link.js';

	const COPIED_FEEDBACK_MS = 2000;
	const ERROR_FEEDBACK_MS = 3000;

	interface Props {
		applicationId: number;
		class?: string;
	}

	let { applicationId, class: className = '' }: Props = $props();

	let copied = $state(false);
	let copyError = $state(false);
	let timeoutId: ReturnType<typeof setTimeout> | undefined;

	function scheduleReset(ms: number, setter: () => void) {
		if (timeoutId) clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			setter();
			timeoutId = undefined;
		}, ms);
	}

	$effect(() => () => {
		if (timeoutId) clearTimeout(timeoutId);
	});

	async function handleClick() {
		copyError = false;
		try {
			await copyApplicationLink(applicationId);
			copied = true;
			scheduleReset(COPIED_FEEDBACK_MS, () => {
				copied = false;
			});
		} catch {
			copyError = true;
			scheduleReset(ERROR_FEEDBACK_MS, () => {
				copyError = false;
			});
		}
	}
</script>

<Button onclick={handleClick} variant="link" size="sm" class={className}>
	{copied ? 'Copied!' : copyError ? 'Failed to copy' : 'Copy link'}
</Button>
