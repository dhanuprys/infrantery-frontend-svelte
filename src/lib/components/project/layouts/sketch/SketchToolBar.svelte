<script lang="ts">
	import { BookOpenText, ChevronLeftIcon } from '@lucide/svelte';
	import AutosaveStatus from '$lib/components/project/AutosaveStatus.svelte';

	let { status = 'saved' }: { status?: 'saved' | 'saving' | 'unsaved' | 'error' } = $props();
</script>

<div class="flex items-center justify-between border-b px-4 py-2">
	<div>
		<AutosaveStatus {status} />
	</div>

	<div class="flex items-center gap-2">
		<button type="button" class="flex items-center gap-x-2 px-2 py-1"
			><ChevronLeftIcon class="size-5" />
			<span class="text-xs">Back to Parent</span></button
		>
		<a href="/project/xx120983/document" class="flex items-center gap-x-2 px-2 py-1"
			><BookOpenText class="size-5" /> <span class="text-xs">Document</span></a
		>
	</div>
</div>
