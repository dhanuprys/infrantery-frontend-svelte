<script lang="ts">
	import { BookOpenText, ChevronLeftIcon } from '@lucide/svelte';
	import AutosaveStatus from '$lib/components/project/AutosaveStatus.svelte';
	import { diagramStore } from '$lib/stores/diagramStore.svelte';

	let {
		status = 'saved'
	}: {
		status?: 'saved' | 'saving' | 'unsaved' | 'error';
	} = $props();
</script>

<div class="flex items-center justify-between border-b px-4 py-2">
	<div>
		<AutosaveStatus {status} />
	</div>

	<div class="flex items-center gap-2">
		{#if diagramStore.parentDiagramId}
			<a
				href={`/projects/${diagramStore.projectId}/diagrams/${diagramStore.parentDiagramId}`}
				class="flex items-center gap-x-2 px-2 py-1"
			>
				<ChevronLeftIcon class="size-5" />
				<span class="text-xs">Back to Parent</span>
			</a>
		{:else}
			<a href={`/projects/${diagramStore.projectId}`} class="flex items-center gap-x-2 px-2 py-1">
				<ChevronLeftIcon class="size-5" />
				<span class="text-xs">Back to Project</span>
			</a>
		{/if}
		<a href="/projects/{diagramStore.projectId}/notes" class="flex items-center gap-x-2 px-2 py-1"
			><BookOpenText class="size-5" /> <span class="text-xs">Project Note</span></a
		>
	</div>
</div>
