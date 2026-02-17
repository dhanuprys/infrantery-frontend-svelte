<script lang="ts">
	import type { NodeWithType } from '$lib/types';
	import { useNodes, useStore, type Node } from '@xyflow/svelte';
	import ImageNodeSetting from './nodes/ImageNodeSetting.svelte';
	import { type ImageNodeProps } from '$lib/components/project/digrams/nodes/ImageNode.svelte';
	import { NodeTypeKey } from '$lib/data/node-types';
	import { type SymbolicParentNodeProps } from '$lib/components/project/digrams/nodes/SymbolicParentNode.svelte';
	import SymbolicParentNodeSetting from './nodes/SymbolicParentNodeSetting.svelte';
	import CommentNodeSetting from './nodes/CommentNodeSetting.svelte';
	import { type CommentNodeProps } from '$lib/components/project/digrams/nodes/CommentNode.svelte';
	import AreaNodeSetting from './nodes/AreaNodeSetting.svelte';
	import { type AreaNodeProps } from '$lib/components/project/digrams/nodes/AreaNode.svelte';
	import { diagramStore } from '$lib/stores/diagramStore.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { ArrowUp, ArrowDown, ChevronsUp, ChevronsDown } from '@lucide/svelte';

	let { node }: { node: NodeWithType } = $props();

	const nodes = useNodes();
	const currentNode = $derived(nodes.current.find((n) => n.id === node.id));

	// Move node up in layer (increase z-index by moving later in array)
	function moveLayerUp() {
		const currentNodes = diagramStore.nodes;
		const currentIndex = currentNodes.findIndex((n) => n.id === node.id);

		if (currentIndex === -1 || currentIndex === currentNodes.length - 1) return;

		const newNodes = [...currentNodes];
		[newNodes[currentIndex], newNodes[currentIndex + 1]] = [
			newNodes[currentIndex + 1],
			newNodes[currentIndex]
		];

		diagramStore.setNodes(newNodes);
		diagramStore.markDirty();
	}

	// Move node down in layer (decrease z-index by moving earlier in array)
	function moveLayerDown() {
		const currentNodes = diagramStore.nodes;
		const currentIndex = currentNodes.findIndex((n) => n.id === node.id);

		if (currentIndex === -1 || currentIndex === 0) return;

		const newNodes = [...currentNodes];
		[newNodes[currentIndex], newNodes[currentIndex - 1]] = [
			newNodes[currentIndex - 1],
			newNodes[currentIndex]
		];

		diagramStore.setNodes(newNodes);
		diagramStore.markDirty();
	}

	// Bring to front (move to end of array)
	function bringToFront() {
		const currentNodes = diagramStore.nodes;
		const currentIndex = currentNodes.findIndex((n) => n.id === node.id);

		if (currentIndex === -1 || currentIndex === currentNodes.length - 1) return;

		const newNodes = currentNodes.filter((n) => n.id !== node.id);
		newNodes.push(currentNodes[currentIndex]);

		diagramStore.setNodes(newNodes);
		diagramStore.markDirty();
	}

	// Send to back (move to beginning of array)
	function sendToBack() {
		const currentNodes = diagramStore.nodes;
		const currentIndex = currentNodes.findIndex((n) => n.id === node.id);

		if (currentIndex === -1 || currentIndex === 0) return;

		const newNodes = currentNodes.filter((n) => n.id !== node.id);
		newNodes.unshift(currentNodes[currentIndex]);

		diagramStore.setNodes(newNodes);
		diagramStore.markDirty();
	}
</script>

<div class="p-4">
	<h1 class="text-lg font-semibold">Node: {currentNode?.data.label || 'No Label'}</h1>
	<p class="text-sm text-muted-foreground">
		x: {currentNode?.position.x} y: {currentNode?.position.y}
	</p>
	<div class="mt-3">
		<p class="mb-2 text-xs font-medium text-muted-foreground">Layer Order</p>
		<div class="flex gap-1">
			<Button variant="outline" size="icon" onclick={bringToFront} title="Bring to Front">
				<ChevronsUp class="h-4 w-4" />
			</Button>
			<Button variant="outline" size="icon" onclick={moveLayerUp} title="Layer Up">
				<ArrowUp class="h-4 w-4" />
			</Button>
			<Button variant="outline" size="icon" onclick={moveLayerDown} title="Layer Down">
				<ArrowDown class="h-4 w-4" />
			</Button>
			<Button variant="outline" size="icon" onclick={sendToBack} title="Send to Back">
				<ChevronsDown class="h-4 w-4" />
			</Button>
		</div>
	</div>
	<div class="mt-8">
		{#if currentNode?.type === NodeTypeKey.IMAGE}
			<ImageNodeSetting node={currentNode as Node<ImageNodeProps, 'number'>} />
		{:else if currentNode?.type === NodeTypeKey.SYMBOLIC_PARENT}
			<SymbolicParentNodeSetting node={currentNode as Node<SymbolicParentNodeProps, 'number'>} />
		{:else if currentNode?.type === NodeTypeKey.AREA}
			<AreaNodeSetting node={currentNode as Node<AreaNodeProps, 'number'>} />
		{:else if currentNode?.type === NodeTypeKey.COMMENT}
			<CommentNodeSetting node={currentNode as Node<CommentNodeProps, 'number'>} />
		{/if}
	</div>
</div>
