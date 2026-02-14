<script lang="ts">
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '$lib/components/ui/select/index.js';
	import { applicationStatuses } from '$lib/shared/application.js';

	interface Props {
		value: string;
		onValueChange: (value: string) => void;
		class?: string;
		disabled?: boolean;
		triggerClass?: string;
	}

	let {
		value,
		onValueChange,
		class: className,
		disabled = false,
		triggerClass = ''
	}: Props = $props();
</script>

<div class={className}>
	<Select type="single" {value} {onValueChange} {disabled}>
		<SelectTrigger class={triggerClass || 'h-9 w-[140px]'} aria-label="Application status">
			{value}
		</SelectTrigger>
		<SelectContent>
			{#each applicationStatuses as status (status)}
				<SelectItem value={status} label={status} />
			{/each}
		</SelectContent>
	</Select>
</div>
