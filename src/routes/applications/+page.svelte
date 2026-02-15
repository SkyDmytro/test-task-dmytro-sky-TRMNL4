<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button/index.js';
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
	import { applicationStatuses } from '$lib/shared/application.js';
	import { formatProgramLabel } from '$lib/shared/format.js';
	import Search from '@lucide/svelte/icons/search';
	import {
		buildApplicationsListQueryString,
		applicationsListPath,
		type ApplicationsListQueryParams
	} from '$lib/applications-list-query.js';
	import { APPLICATIONS_SEARCH_DEBOUNCE_MS } from '$lib/constants.js';
	import type {
		ApplicationListItem,
		ProgramListItem
	} from '$lib/server/applications-repository.js';
	import type { ApplicationStatus } from '$lib/shared/application.js';
	import ApplicationRow from './application-row.svelte';

	const TABLE_COLUMNS = 6;
	const GOTO_OPTS = { replaceState: true, keepFocus: true, noScroll: true } as const;

	interface ApplicationsPageData {
		programs: ProgramListItem[];
		selectedProgramId: number | null;
		applications: ApplicationListItem[];
		total: number;
		page: number;
		pageSize: number;
		statusFilter?: ApplicationStatus;
		dateFromInputValue?: string;
		dateToInputValue?: string;
		search?: string;
	}

	let {
		data,
		form
	}: {
		data: ApplicationsPageData;
		form: { message?: string } | undefined;
	} = $props();

	let programs = $derived(data.programs);
	let selectedProgramId = $derived(data.selectedProgramId);
	let selectedProgram = $derived(
		selectedProgramId != null ? (programs.find((p) => p.id === selectedProgramId) ?? null) : null
	);
	let applications = $derived(data.applications);
	let total = $derived(data.total);
	let page = $derived(data.page);
	let pageSize = $derived(data.pageSize);
	let totalPages = $derived(Math.ceil(total / pageSize) || 1);
	let statusFilter = $derived(data.statusFilter);
	let dateFromInputValue = $derived(data.dateFromInputValue);
	let dateToInputValue = $derived(data.dateToInputValue);
	let currentSearch = $derived(data.search ?? undefined);
	let hasActiveFilters = $derived(
		!!(statusFilter || dateFromInputValue || dateToInputValue || currentSearch)
	);

	let searchInput = $derived(currentSearch ?? '');
	let searchDebounceId = $state<ReturnType<typeof setTimeout> | undefined>(undefined);

	$effect(() => {
		const timerId = searchDebounceId;
		return () => {
			if (timerId != null) clearTimeout(timerId);
		};
	});

	function currentParams(): ApplicationsListQueryParams {
		return {
			programId: selectedProgramId ?? undefined,
			page,
			status: statusFilter,
			dateFrom: dateFromInputValue,
			dateTo: dateToInputValue,
			search: currentSearch
		};
	}

	function mergeAndNavigate(patch: Partial<ApplicationsListQueryParams>, opts = GOTO_OPTS) {
		const merged = { ...currentParams(), ...patch };
		goto(applicationsListPath(buildApplicationsListQueryString(merged)), opts);
	}

	function handleProgramChange(value: string) {
		mergeAndNavigate({
			programId: value ? Number(value) : undefined,
			page: 1
		});
	}

	function handleStatusFilterChange(value: string) {
		mergeAndNavigate({
			status: value === '' ? undefined : (value as ApplicationStatus),
			page: 1
		});
	}

	function handleDateFromChange(e: Event) {
		const v = (e.target as HTMLInputElement).value;
		mergeAndNavigate({ dateFrom: v || undefined, page: 1 });
	}

	function handleDateToChange(e: Event) {
		const v = (e.target as HTMLInputElement).value;
		mergeAndNavigate({ dateTo: v || undefined, page: 1 });
	}

	function handleSearchInput() {
		if (searchDebounceId != null) clearTimeout(searchDebounceId);
		searchDebounceId = setTimeout(() => {
			searchDebounceId = undefined;
			const q = searchInput.trim();
			mergeAndNavigate({ search: q || undefined, page: 1 });
		}, APPLICATIONS_SEARCH_DEBOUNCE_MS);
	}

	function goToPage(newPage: number) {
		if (newPage < 1 || newPage > totalPages) return;
		mergeAndNavigate({ page: newPage });
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

	{#if selectedProgramId != null}
		<section class="mt-6 rounded-lg border bg-card p-4">
			<div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
				<label class="grid gap-1 text-sm">
					<span class="font-medium">Status</span>
					<Select type="single" value={statusFilter ?? ''} onValueChange={handleStatusFilterChange}>
						<SelectTrigger class="h-10 w-[140px]" aria-label="Filter by status">
							{statusFilter ?? 'All'}
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="" label="All" />
							{#each applicationStatuses as status (status)}
								<SelectItem value={status} label={status} />
							{/each}
						</SelectContent>
					</Select>
				</label>
				<label class="grid gap-1 text-sm">
					<span class="font-medium">Created from</span>
					<input
						type="date"
						class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none sm:w-[160px]"
						value={dateFromInputValue ?? ''}
						onchange={handleDateFromChange}
						aria-label="Filter from date"
					/>
				</label>
				<label class="grid gap-1 text-sm">
					<span class="font-medium">Created to</span>
					<input
						type="date"
						class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none sm:w-[160px]"
						value={dateToInputValue ?? ''}
						onchange={handleDateToChange}
						aria-label="Filter to date"
					/>
				</label>
				<label class="grid gap-1 text-sm sm:ml-auto">
					<span class="font-medium">Search</span>
					<div class="relative">
						<Search
							class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
							aria-hidden="true"
						/>
						<input
							type="search"
							class="flex h-10 w-full rounded-md border border-input bg-transparent py-1 pr-3 pl-9 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none sm:w-[220px]"
							placeholder="Startup, founder, email..."
							bind:value={searchInput}
							oninput={handleSearchInput}
							aria-label="Search applications"
						/>
					</div>
				</label>
			</div>
		</section>
	{/if}

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
						<TableCell class="px-4 py-6 text-muted-foreground" colspan={TABLE_COLUMNS}
							>No programs found.</TableCell
						>
					</TableRow>
				{:else if applications.length === 0}
					<TableRow>
						<TableCell class="px-4 py-6 text-muted-foreground" colspan={TABLE_COLUMNS}>
							{#if hasActiveFilters}
								No applications match the current filters.
								<span class="mt-1 block text-xs">Try adjusting filters or search.</span>
							{:else}
								No applications for this program.
							{/if}
						</TableCell>
					</TableRow>
				{:else}
					{#each applications as application (application.id)}
						<ApplicationRow {application} selectedProgramId={selectedProgramId!} />
					{/each}
				{/if}
			</TableBody>
		</Table>
		{#if selectedProgramId != null && total > 0 && totalPages > 1}
			<div class="mt-4 flex items-center justify-between border-t pt-4">
				<p class="text-sm text-muted-foreground">
					Page {page} of {totalPages}
					<span class="ml-2">({total} total)</span>
				</p>
				<div class="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						disabled={page <= 1}
						onclick={() => goToPage(page - 1)}
					>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						disabled={page >= totalPages}
						onclick={() => goToPage(page + 1)}
					>
						Next
					</Button>
				</div>
			</div>
		{/if}
	</section>
</main>
