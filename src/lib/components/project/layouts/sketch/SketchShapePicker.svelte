<script lang="ts">
	import { Separator } from '$lib/components/ui/separator';
	import { diagramStore } from '$lib/stores/diagramStore.svelte';
	import { shapes, type Shape } from '$lib/data/shapes';

	import { useSvelteFlow, type XYPosition } from '@xyflow/svelte';

	let activeShape: Shape | null = null;
	let mousePosition = $state.raw<{ x: number; y: number }>({ x: 0, y: 0 });
	const { screenToFlowPosition } = useSvelteFlow();

	function calculateBounding(mouseX: number, mouseY: number) {
		if (!diagramStore.container) return { x: mouseX, y: mouseY, bounding: null };
		const bounding = diagramStore.container.getBoundingClientRect();
		let normalized = false;

		// make sure it doesn't go into outside the box

		if (mouseX > bounding.left + bounding.width) {
			mouseX = bounding.left + bounding.width;
			normalized = true;
		}

		if (mouseY > bounding.top + bounding.height) {
			mouseY = bounding.top + bounding.height;
			normalized = true;
		}

		if (mouseX < bounding.left) {
			mouseX = bounding.left;
			normalized = true;
		}

		if (mouseY < bounding.top) {
			mouseY = bounding.top;
			normalized = true;
		}

		return {
			x: mouseX,
			y: mouseY,
			bounding,
			normalized
		};
	}

	function handleDragStart(e: MouseEvent, shape: Shape) {
		diagramStore.nodeDrag = {
			isDragging: true,
			isInsideBox: false
		};
		activeShape = shape;
		mousePosition = calculateBounding(e.clientX, e.clientY);
	}

	function handleDragEnd(e: MouseEvent) {
		if (!diagramStore.nodeDrag.isDragging) return;

		const boundingPosition = calculateBounding(e.clientX, e.clientY);

		// prevent click once
		if (e.clientX - (boundingPosition.bounding?.x || 0) > 5) {
			if (activeShape && activeShape.nodePayload.type) {
				diagramStore.addNode(
					activeShape.nodePayload.type,
					activeShape.nodePayload.data,
					screenToFlowPosition(boundingPosition)
				);
			}
		}

		diagramStore.nodeDrag = { isDragging: false, isInsideBox: false };
		mousePosition = { x: 0, y: 0 };
	}

	function handleDrag(e: MouseEvent) {
		if (!diagramStore.nodeDrag.isDragging) return;
		e.preventDefault();

		const boundingArea = calculateBounding(e.clientX, e.clientY);
		diagramStore.nodeDrag = {
			isDragging: true,
			isInsideBox: !boundingArea.normalized
		};
		mousePosition = { x: boundingArea.x, y: boundingArea.y };
	}
</script>

{#snippet shapeButton(shape: Shape)}
	<div
		role="button"
		tabindex="0"
		onmousedown={(e) => handleDragStart(e, shape)}
		class="aspect-square select-none hover:cursor-grab {diagramStore.nodeDrag.isDragging
			? 'cursor-grabbing! opacity-50'
			: ''} flex aspect-square! w-full cursor-pointer flex-col items-center justify-center py-1"
	>
		<shape.icon class="size-5" />
		<span class="mt-1 text-[9px]">{shape.label}</span>
	</div>
{/snippet}

<svelte:body onmousemove={handleDrag} onmouseup={handleDragEnd} />

<div class="flex flex-col justify-end space-y-1 border-r bg-background p-2 text-foreground">
	<div class="flex flex-col gap-2">
		{#each shapes as shape (shape.label)}
			{@render shapeButton(shape)}
		{/each}
	</div>
	<Separator orientation="horizontal" />
</div>

<div
	class="fixed z-50 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-md border bg-background opacity-0 {diagramStore
		.nodeDrag.isDragging
		? 'opacity-90'
		: ''}"
	style:top="{mousePosition.y}px"
	style:left="{mousePosition.x}px"
></div>
