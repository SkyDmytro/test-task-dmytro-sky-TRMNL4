<script lang="ts">
	import { copyApplicationLink } from '$lib/shared/copy-application-link.js';
	import { Button } from './ui/button';

	interface Props {
		applicationId: number;
		class?: string;
	}

	let { applicationId, class: className = '' }: Props = $props();

	let copied = $state(false);

	async function handleClick() {
		await copyApplicationLink(applicationId);
		copied = true;
		setTimeout(() => {
			copied = false;
		}, 2000);
	}
</script>

<Button onclick={handleClick} variant="link" size="sm" class={className}>
	{copied ? 'Copied!' : 'Copy link'}
</Button>
