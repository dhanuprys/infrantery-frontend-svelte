<script lang="ts">
	import type { NodeWithType } from '$lib/types';
	import { useNodes, type Node } from '@xyflow/svelte';
	import ImageNodeSetting from './nodes/ImageNodeSetting.svelte';
	import { type ImageNodeProps } from '$lib/components/project/digrams/nodes/ImageNode.svelte';
	import { NodeTypeKey } from '$lib/data/node-types';

	let { node }: { node: NodeWithType } = $props();

	const nodes = useNodes();
	const currentNode = $derived(nodes.current.find((n) => n.id === node.id));
</script>

<div class="p-4">
	<h1 class="text-lg font-semibold">Node: {currentNode?.data.label || 'No Label'}</h1>
	<p class="text-sm text-muted-foreground">
		x: {currentNode?.position.x} y: {currentNode?.position.y}
	</p>
	<div class="mt-8">
		{#if currentNode?.type === NodeTypeKey.IMAGE}
			<ImageNodeSetting node={currentNode as Node<ImageNodeProps, 'number'>} />
		{/if}
	</div>
</div>
