<script lang="ts">
	import { BookOpenText } from '@lucide/svelte';
	import AutosaveStatus from '$lib/components/project/AutosaveStatus.svelte';

	let {
		projectId,
		status = 'saved',
		lastSaved = null
	} = $props<{
		projectId: string;
		status?: 'saved' | 'saving' | 'unsaved' | 'error';
		lastSaved?: Date | null;
	}>();
</script>

<div class="flex items-center justify-between border-b bg-background px-4 py-2">
	<div>
		<AutosaveStatus {status} {lastSaved} />
	</div>

	<div class="flex items-center gap-2">
		<a href="/projects/{projectId}/diagram" class="flex items-center gap-x-2 px-2 py-1"
			><BookOpenText class="size-5" /> <span class="text-xs">Open Diagram</span></a
		>
	</div>
</div>
