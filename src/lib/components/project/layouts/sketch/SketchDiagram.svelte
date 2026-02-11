<script lang="ts">
	import {
		Background,
		BackgroundVariant,
		Controls,
		getConnectedEdges,
		getIncomers,
		getOutgoers,
		MiniMap,
		Panel,
		SvelteFlow,
		useSvelteFlow,
		type Edge,
		type Node,
		type OnBeforeDelete
	} from '@xyflow/svelte';
	import '@xyflow/svelte/dist/style.css';
	import { mode } from 'mode-watcher';
	import { diagramStore } from '$lib/stores/diagramStore.svelte';
	import { nodeTypes } from '$lib/data/node-types';
	import { afterNavigate, beforeNavigate } from '$app/navigation';

	let colorMode = $derived(mode.current || 'light');
	const { screenToFlowPosition, getViewport } = useSvelteFlow();

	let viewport = $derived(getViewport());

	beforeNavigate(() => {
		diagramStore.setActiveObject(null);
	});

	const onbeforedelete: OnBeforeDelete = async ({ nodes: deletedNodes, edges: _edges }) => {
		let remainingNodes = [...diagramStore.nodes];

		diagramStore.setEdges(
			deletedNodes.reduce((acc, node) => {
				const incomers = getIncomers(node, remainingNodes, acc);
				const outgoers = getOutgoers(node, remainingNodes, acc);
				const connectedEdges = getConnectedEdges([node], acc);

				const remainingEdges = acc.filter((edge) => !connectedEdges.includes(edge));

				const createdEdges = incomers.flatMap(({ id: source }) =>
					outgoers.map(({ id: target }) => ({
						id: `${source}->${target}`,
						source,
						target
					}))
				);

				remainingNodes = remainingNodes.filter((rn) => rn.id !== node.id);

				return [...remainingEdges, ...createdEdges];
			}, diagramStore.edges)
		);

		diagramStore.setNodes(remainingNodes);

		return true;
	};

	function handlePaneClick(e: any) {
		const clientX = e.event.clientX;
		const clientY = e.event.clientY;

		const flowPosition = screenToFlowPosition({ x: clientX, y: clientY });
		diagramStore.setLastClickPosition(flowPosition);

		diagramStore.setActiveObject(null);
	}

	function handleNodeClick(e: { node: Node }) {
		diagramStore.setActiveObject({
			type: 'node',
			target: e.node
		});
	}

	function handleEdgeClick(e: { edge: Edge }) {
		diagramStore.setActiveObject({
			type: 'edge',
			target: e.edge
		});
	}

	function handleKeyUp(e: KeyboardEvent) {
		if (e.key.toLowerCase() === 'escape') {
			diagramStore.setActiveObject(null);
		}
	}
</script>

<svelte:body onkeyup={handleKeyUp} />

<SvelteFlow
	bind:nodes={diagramStore.nodes}
	bind:edges={diagramStore.edges}
	fitView
	{colorMode}
	snapGrid={[10, 10]}
	onpaneclick={handlePaneClick}
	onnodeclick={handleNodeClick}
	onedgeclick={handleEdgeClick}
	{onbeforedelete}
	{nodeTypes}
	onnodedragstop={() => diagramStore.markDirty()}
	onconnect={() => diagramStore.markDirty()}
>
	<Background variant={BackgroundVariant.Dots} />
	<Controls />
	<Panel position="top-left">
		<div class="flex flex-row gap-2 text-xs text-muted-foreground">
			<span>X: {Math.round(viewport.x * 100) / 100}</span>
			<span>Y: {Math.round(viewport.y * 100) / 100}</span>
			<span>Zoom: {Math.round(viewport.zoom * 100) / 100}</span>
		</div>
	</Panel>
	<MiniMap />
</SvelteFlow>
