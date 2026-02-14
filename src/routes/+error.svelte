<script lang="ts">
	import { page } from '$app/state';
</script>

<main class="mx-auto w-full max-w-xl px-4 py-20 text-center">
	<h1 class="text-4xl font-semibold tracking-tight">{page.status}</h1>
	<p class="mt-4 text-muted-foreground">{page.error?.message ?? 'Something went wrong.'}</p>
	<a class="mt-8 inline-block text-sm font-medium underline-offset-4 hover:underline" href="/"
		>Go home</a
	>
</main>
