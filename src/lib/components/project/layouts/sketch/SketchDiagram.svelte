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
	import { beforeNavigate } from '$app/navigation';
	import { untrack } from 'svelte';

	let diagramContainer: HTMLElement;
	let diagramViewport = $state({ x: 20, y: 20, zoom: 1 });
	let showDiagram = $state(true);
	let fitDiagramView = $state(true);

	let colorMode = $derived(mode.current || 'light');
	const { screenToFlowPosition, getViewport } = useSvelteFlow();

	beforeNavigate(() => {
		diagramStore.setActiveObject(null);
		fitDiagramView = true;
	});

	$effect(() => {
		if (diagramContainer) {
			untrack(() => diagramStore.setContainer(diagramContainer));
		}
	});

	// force rerender
	$effect(() => {
		if (diagramStore.needRerender) {
			untrack(() => {
				const backupViewport = { ...diagramViewport };

				showDiagram = false;
				fitDiagramView = false;
				setTimeout(() => {
					diagramViewport = backupViewport;
					diagramStore.rerenderDone();
					showDiagram = true;
				}, 500);
			});
		}
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

<div class="relative w-full border-2 {diagramStore.nodeDrag.isDragging ? 'border-blue-500' : ''}">
	<div
		class="absolute border-2 border-dashed opacity-0 transition-opacity delay-200 {diagramStore
			.nodeDrag.isDragging && !diagramStore.nodeDrag.isInsideBox
			? 'z-49 opacity-100!'
			: ''} flex size-full items-center justify-center bg-background/80"
	>
		<p>Drag nodes into this area</p>
	</div>
	<div class="size-full" bind:this={diagramContainer}>
		<div
			class="pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-background/80 opacity-0 transition-opacity {!showDiagram
				? 'opacity-100'
				: ''}"
		>
			<p>Re-rendering...</p>
		</div>
		{#if showDiagram}
			<SvelteFlow
				bind:viewport={diagramViewport}
				bind:nodes={diagramStore.nodes}
				bind:edges={diagramStore.edges}
				fitView={fitDiagramView}
				{colorMode}
				snapGrid={[5, 5]}
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
						<span>X: {Math.round(diagramViewport.x * 100) / 100}</span>
						<span>Y: {Math.round(diagramViewport.y * 100) / 100}</span>
						<span>Zoom: {Math.round(diagramViewport.zoom * 100) / 100}</span>
					</div>
				</Panel>
				<MiniMap />
			</SvelteFlow>
		{/if}
	</div>
</div>
