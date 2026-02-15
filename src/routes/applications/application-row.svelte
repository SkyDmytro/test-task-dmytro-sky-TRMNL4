<script lang="ts">
	import { goto } from '$app/navigation';
	import ApplicationStatusSelect from '$lib/components/application-status-select.svelte';
	import CopyLinkButton from '$lib/components/copy-link-button.svelte';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu/index.js';
	import { TableCell, TableRow } from '$lib/components/ui/table/index.js';
	import type { ApplicationListItem } from '$lib/server/applications-repository.js';
	import { formatDate } from '$lib/shared/format.js';
	import { submitStatusForm } from '$lib/shared/status-form.js';
	import MoreVertical from '@lucide/svelte/icons/more-vertical';

	interface Props {
		application: ApplicationListItem;
		selectedProgramId: number;
	}

	let { application, selectedProgramId }: Props = $props();
	let formRef = $state<HTMLFormElement | undefined>(undefined);
</script>

<TableRow>
	<TableCell class="px-4 py-3 font-medium">{application.startupName}</TableCell>
	<TableCell class="px-4 py-3">{application.founderName}</TableCell>
	<TableCell class="px-4 py-3">
		<a class="underline-offset-4 hover:underline" href={`mailto:${application.email}`}
			>{application.email}</a
		>
	</TableCell>
	<TableCell class="px-4 py-3">{formatDate(application.createdAt)}</TableCell>
	<TableCell class="px-4 py-3">
		<form method="post" action="?/updateStatus" bind:this={formRef}>
			<input type="hidden" name="applicationId" value={application.id} />
			<input type="hidden" name="programId" value={selectedProgramId} />
			<input type="hidden" name="status" value={application.status} />
			<ApplicationStatusSelect
				value={application.status}
				onValueChange={(v: string) => submitStatusForm(formRef, v)}
				ariaLabel={`Application status for ${application.startupName}`}
			/>
		</form>
	</TableCell>
	<TableCell class="px-4 py-3">
		<DropdownMenu>
			<DropdownMenuTrigger
				class="inline-flex h-9 w-9 items-center justify-center rounded-md outline-none hover:bg-accent hover:text-accent-foreground"
				aria-label="Actions"
			>
				<MoreVertical class="size-4" />
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem onSelect={() => goto(`/applications/${application.id}`)}>
					View details
				</DropdownMenuItem>
				<DropdownMenuItem>
					<CopyLinkButton
						applicationId={application.id}
						class="h-auto w-full justify-start font-normal"
					/>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	</TableCell>
</TableRow>
