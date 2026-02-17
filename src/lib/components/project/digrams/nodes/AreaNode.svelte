<script module lang="ts">
	import { NodeResizer, type Node } from '@xyflow/svelte';

	export type AreaNodeProps = {
		label: string;
		hexColor?: string;
	};
	export type AreaNodeType = Node<AreaNodeProps, 'number'>;
</script>

<script lang="ts">
	import { type NodeProps } from '@xyflow/svelte';
	import { diagramStore } from '$lib/stores/diagramStore.svelte';

	let { id, data }: NodeProps<AreaNodeType> = $props();

	let selected = $derived(diagramStore.activeObject?.target.id === id);
</script>

<div
	class="flex size-full min-h-22 min-w-22 flex-col rounded border dark:border-gray-500/40 {selected
		? 'border-2 dark:border-primary/80!'
		: ''}"
>
	{#if selected}
		<NodeResizer />
	{/if}
	{#if data.label}
		<div class="w-full rounded-t border-b bg-background px-2 py-0.5 text-center text-[0.5rem]">
			{data.label}
		</div>
	{/if}
	<div
		class="pointer-events-none relative flex flex-1 items-center justify-center overflow-hidden rounded-b opacity-40"
		style="background-color: {data.hexColor ?? 'var(--background)'}"
	></div>
</div>
