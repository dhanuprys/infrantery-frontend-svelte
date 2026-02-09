<script lang="ts">
	import {
		CloudCheckIcon,
		CloudUploadIcon,
		TriangleAlertIcon,
		CircleDashedIcon
	} from '@lucide/svelte';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { cn } from '$lib/utils';
	import { fade } from 'svelte/transition';

	let {
		status = 'saved',
		lastSaved = null,
		class: className
	}: {
		status: 'saved' | 'saving' | 'unsaved' | 'error';
		lastSaved?: Date | null;
		class?: string;
	} = $props();
</script>

<div class={cn('relative grid items-center px-2 py-1', className)}>
	{#if status === 'saved'}
		<div
			transition:fade={{ duration: 200 }}
			class="col-start-1 row-start-1 flex items-center gap-x-2 text-green-600"
		>
			<CloudCheckIcon class="size-5" />
			<Tooltip.Root>
				<Tooltip.Trigger>
					<span class="cursor-help text-xs">Autosaved</span>
				</Tooltip.Trigger>
				<Tooltip.Content>
					{#if lastSaved}
						<p>Last saved at {lastSaved.toLocaleTimeString()}</p>
					{:else}
						<p>All changes saved</p>
					{/if}
				</Tooltip.Content>
			</Tooltip.Root>
		</div>
	{/if}

	{#if status === 'saving'}
		<div
			transition:fade={{ duration: 200 }}
			class="col-start-1 row-start-1 flex items-center gap-x-2 text-muted-foreground"
		>
			<CloudUploadIcon class="size-5 animate-pulse" />
			<span class="text-xs">Saving...</span>
		</div>
	{/if}

	{#if status === 'unsaved'}
		<div
			transition:fade={{ duration: 200 }}
			class="col-start-1 row-start-1 flex items-center gap-x-2 text-amber-500"
		>
			<CircleDashedIcon class="size-5" />
			<span class="text-xs">Unsaved changes</span>
		</div>
	{/if}

	{#if status === 'error'}
		<div
			transition:fade={{ duration: 200 }}
			class="col-start-1 row-start-1 flex items-center gap-x-2 text-destructive"
		>
			<TriangleAlertIcon class="size-5" />
			<span class="text-xs">Save failed</span>
		</div>
	{/if}
</div>
