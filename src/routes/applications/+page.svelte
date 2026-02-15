<script lang="ts">
	import { goto } from '$app/navigation';
	import ApplicationStatusSelect from '$lib/components/application-status-select.svelte';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu/index.js';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '$lib/components/ui/select/index.js';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table/index.js';
	import CopyLinkButton from '$lib/components/copy-link-button.svelte';
	import { formatDate, formatProgramLabel } from '$lib/shared/format.js';
	import { submitStatusForm } from '$lib/shared/status-form.js';
	import MoreVertical from '@lucide/svelte/icons/more-vertical';
	import type { ApplicationListItem, ProgramListItem } from '$lib/server/applications-repository';

	const APPLICATIONS_TABLE_COLUMNS = 6;

	let {
		data,
		form
	}: {
		data: {
			programs: ProgramListItem[];
			selectedProgramId: number | null;
			applications: ApplicationListItem[];
		};
		form: { message?: string } | undefined;
	} = $props();

	let programs = $derived(data.programs);
	let selectedProgramId = $derived(data.selectedProgramId);
	let selectedProgram = $derived(
		selectedProgramId != null ? (programs.find((p) => p.id === selectedProgramId) ?? null) : null
	);
	let applications = $derived(data.applications);

	let statusFormRefs = $state<Record<number, HTMLFormElement>>({});

	function handleProgramChange(value: string) {
		goto(value ? `/applications?programId=${encodeURIComponent(value)}` : '/applications');
	}

	function handleStatusChange(applicationId: number, newValue: string) {
		submitStatusForm(statusFormRefs[applicationId], newValue);
	}
</script>

<main class="mx-auto w-full max-w-5xl px-4 py-10">
	<header class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
		<div class="space-y-1">
			<h1 class="text-2xl font-semibold tracking-tight">Applications</h1>
			<p class="text-sm text-muted-foreground">
				Select a program to review and update application statuses.
			</p>
		</div>
	</header>

	{#if form?.message}
		<p class="mt-4 text-sm text-destructive">{form.message}</p>
	{/if}

	<section class="mt-6 rounded-lg border bg-card p-4">
		<div class="flex flex-col gap-3 sm:flex-row sm:items-end">
			<label class="grid gap-1 text-sm">
				<span class="font-medium">Program</span>
				<Select
					type="single"
					value={selectedProgramId != null ? String(selectedProgramId) : ''}
					onValueChange={handleProgramChange}
				>
					<SelectTrigger class="h-10 w-full sm:w-[320px]" aria-label="Select program">
						{formatProgramLabel(selectedProgram) || 'Select program'}
					</SelectTrigger>
					<SelectContent>
						{#each programs as program (program.id)}
							<SelectItem value={String(program.id)} label={formatProgramLabel(program)} />
						{/each}
					</SelectContent>
				</Select>
			</label>
		</div>
	</section>

	<section class="mt-6 rounded-lg border bg-card p-4">
		<Table class="min-w-[860px]">
			<TableHeader>
				<TableRow>
					<TableHead class="px-4 py-3">Startup</TableHead>
					<TableHead class="px-4 py-3">Founder</TableHead>
					<TableHead class="px-4 py-3">Email</TableHead>
					<TableHead class="px-4 py-3">Created</TableHead>
					<TableHead class="px-4 py-3">Status</TableHead>
					<TableHead class="px-4 py-3">Links</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#if !selectedProgramId}
					<TableRow>
						<TableCell class="px-4 py-6 text-muted-foreground" colspan={APPLICATIONS_TABLE_COLUMNS}
							>No programs found.</TableCell
						>
					</TableRow>
				{:else if applications.length === 0}
					<TableRow>
						<TableCell class="px-4 py-6 text-muted-foreground" colspan={APPLICATIONS_TABLE_COLUMNS}
							>No applications for this program.</TableCell
						>
					</TableRow>
				{:else}
					{#each applications as application (application.id)}
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
								<form
									method="post"
									action="?/updateStatus"
									bind:this={statusFormRefs[application.id]}
								>
									<input type="hidden" name="applicationId" value={application.id} />
									<input type="hidden" name="programId" value={selectedProgramId} />
									<input type="hidden" name="status" value={application.status} />
									<ApplicationStatusSelect
										value={application.status}
										onValueChange={(v: string) => handleStatusChange(application.id, v)}
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
					{/each}
				{/if}
			</TableBody>
		</Table>
	</section>
</main>
