<script lang="ts">
	import { BookOpenText, ChevronDown } from '@lucide/svelte';
	import AutosaveStatus from '$lib/components/project/AutosaveStatus.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { onMount } from 'svelte';
	import { diagramService } from '$lib/services/diagram.service';
	import type { DiagramResponse } from '$lib/types/api';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';

	let {
		projectId,
		status = 'saved',
		lastSaved = null
	} = $props<{
		projectId: string;
		status?: 'saved' | 'saving' | 'unsaved' | 'error';
		lastSaved?: Date | null;
	}>();

	let diagrams = $state<DiagramResponse[]>([]);
	let loading = $state(false);

	async function loadDiagrams() {
		loading = true;
		try {
			const res = await diagramService.getDiagrams({ project_id: projectId, rootOnly: true });
			diagrams = res.data || [];
		} catch (error) {
			console.error('Failed to load diagrams:', error);
			// toast.error('Failed to load diagrams');
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		if (projectId) {
			loadDiagrams();
		}
	});
</script>

<div class="flex items-center justify-between border-b bg-background px-4 py-2">
	<div>
		<AutosaveStatus {status} {lastSaved} />
	</div>

	<div class="flex items-center gap-2">
		<DropdownMenu.Root>
			<DropdownMenu.Trigger
				class="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium whitespace-nowrap ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
			>
				<BookOpenText class="size-4" />
				<span>Open Diagram</span>
				<ChevronDown class="size-4 opacity-50" />
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end" class="w-56">
				<DropdownMenu.Label>Select Diagram</DropdownMenu.Label>
				<DropdownMenu.Separator />
				{#if loading}
					<DropdownMenu.Item disabled>Loading...</DropdownMenu.Item>
				{:else if diagrams.length === 0}
					<DropdownMenu.Item disabled>No diagrams found</DropdownMenu.Item>
				{:else}
					{#each diagrams as diagram (diagram.id)}
						<DropdownMenu.Item
							onclick={() => goto(`/projects/${projectId}/diagrams/${diagram.id}`)}
						>
							{diagram.diagram_name}
						</DropdownMenu.Item>
					{/each}
				{/if}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
</div>
