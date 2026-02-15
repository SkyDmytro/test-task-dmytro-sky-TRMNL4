<script lang="ts">
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '$lib/components/ui/select/index.js';
	import { applicationStatuses, type ApplicationStatus } from '$lib/shared/application.js';

	interface Props {
		value: ApplicationStatus;
		onValueChange: (value: ApplicationStatus) => void;
		class?: string;
		disabled?: boolean;
		triggerClass?: string;
		ariaLabel?: string;
	}

	let {
		value,
		onValueChange,
		class: className,
		disabled = false,
		triggerClass = '',
		ariaLabel = 'Application status'
	}: Props = $props();
</script>

<div class={className}>
	<Select
		type="single"
		{value}
		onValueChange={(v) => onValueChange(v as ApplicationStatus)}
		{disabled}
	>
		<SelectTrigger class={triggerClass || 'h-9 w-[140px]'} aria-label={ariaLabel}>
			{value}
		</SelectTrigger>
		<SelectContent>
			{#each applicationStatuses as status (status)}
				<SelectItem value={status} label={status} />
			{/each}
		</SelectContent>
	</Select>
</div>
