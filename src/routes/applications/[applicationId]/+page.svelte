<script lang="ts">
	import ApplicationStatusSelect from '$lib/components/application-status-select.svelte';
	import CopyLinkButton from '$lib/components/copy-link-button.svelte';
	import { formatDate, formatProgramLabel } from '$lib/shared/format.js';
	import { submitStatusForm } from '$lib/shared/status-form.js';
	import type { ApplicationDetailItem } from '$lib/server/applications-repository.js';

	let {
		data,
		form
	}: { data: { application: ApplicationDetailItem }; form: { message?: string } | undefined } =
		$props();

	let application = $derived(data.application);
	let statusFormRef = $state<HTMLFormElement | undefined>(undefined);

	function handleStatusChange(newValue: string) {
		submitStatusForm(statusFormRef, newValue);
	}
</script>

<main class="mx-auto w-full max-w-3xl px-4 py-10">
	<header class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
		<div class="space-y-1">
			<h1 class="text-2xl font-semibold tracking-tight">{application.startupName}</h1>
			<p class="text-sm text-muted-foreground">
				Program: {formatProgramLabel({
					name: application.programName,
					isActive: application.programIsActive
				})}
			</p>
		</div>
		<div class="flex items-center gap-3">
			<a class="text-sm font-medium underline-offset-4 hover:underline" href="/applications"
				>Back to list</a
			>
		</div>
	</header>

	{#if form?.message}
		<p class="mt-4 text-sm text-destructive">{form.message}</p>
	{/if}

	<section class="mt-6 grid gap-4 rounded-lg border bg-card p-4">
		<div class="grid gap-1">
			<div class="text-xs font-medium text-muted-foreground">Founder</div>
			<div class="text-sm">{application.founderName}</div>
		</div>

		<div class="grid gap-1">
			<div class="text-xs font-medium text-muted-foreground">Email</div>
			<div class="text-sm">
				<a class="underline-offset-4 hover:underline" href={`mailto:${application.email}`}
					>{application.email}</a
				>
			</div>
		</div>

		<div class="grid gap-1">
			<div class="text-xs font-medium text-muted-foreground">Submitted</div>
			<div class="text-sm">{formatDate(application.createdAt)}</div>
		</div>

		<div class="grid gap-2 pt-2">
			<div class="text-xs font-medium text-muted-foreground">Status</div>
			<form method="post" action="?/updateStatus" bind:this={statusFormRef}>
				<input type="hidden" name="status" value={application.status} />
				<ApplicationStatusSelect
					value={application.status}
					onValueChange={handleStatusChange}
					triggerClass="h-10 w-full sm:w-[240px]"
				/>
			</form>
		</div>
	</section>

	<section class="mt-6 rounded-lg border bg-card p-4">
		<div class="text-xs font-medium text-muted-foreground">Share link</div>
		<div class="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
			<a
				class="text-sm font-medium break-all underline-offset-4 hover:underline"
				href={`/applications/${application.id}`}>/applications/{application.id}</a
			>
			<CopyLinkButton applicationId={application.id} />
		</div>
	</section>
</main>
