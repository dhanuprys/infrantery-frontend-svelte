<script lang="ts">
	import { Separator } from '$lib/components/ui/separator';
	import { diagramStore } from '$lib/stores/diagramStore.svelte';
	import { shapes, type Shape } from '$lib/data/shapes';

	function addNode(type?: string, data?: Record<string, unknown>) {
		const { x: lastX, y: lastY } = diagramStore.lastClickPosition;

		if (!type) {
			console.error('No node type provided');
			return;
		}

		diagramStore.setNodes([
			...diagramStore.nodes,
			{
				id: (diagramStore.nodes.length + 1).toString(),
				type,
				position: { x: lastX, y: lastY },
				data: { label: 'Node ' + (diagramStore.nodes.length + 1), ...data }
			}
		]);

		// avoid last click position to be same as the node position
		diagramStore.setLastClickPosition({ x: lastX + 10, y: lastY + 10 });
	}
</script>

{#snippet shapeButton(shape: Shape)}
	<button
		type="button"
		onclick={() => addNode(shape.nodePayload.type, shape.nodePayload.data)}
		class="apsect-square flex aspect-square! w-full cursor-pointer flex-col items-center justify-center py-1"
	>
		<shape.icon class="size-5" />
		<span class="mt-1 text-[9px]">{shape.label}</span>
	</button>
{/snippet}

<div class="flex flex-col justify-end space-y-1 border-r bg-background p-2 text-foreground">
	<div class="flex flex-col gap-2">
		{#each shapes as shape}
			{@render shapeButton(shape)}
		{/each}
	</div>
	<Separator orientation="horizontal" />
</div>
